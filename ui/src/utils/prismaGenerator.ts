import type {
    PrismaProject, PrismaModel, PrismaField, PrismaEnum, PrismaRelation,
    DatabaseProvider
} from '@/types/app.types';

export class PrismaSchemaGenerator {

    static generateSchema(project: PrismaProject): string {
        let schema = '';

        // Generator block
        schema += this.generateGeneratorBlock(project.generatorConfig);
        schema += '\n\n';

        // Datasource block
        schema += this.generateDatasourceBlock(project.databaseProvider, project.databaseUrl);
        schema += '\n\n';

        // Enums
        if (project.enums.length > 0) {
            project.enums.forEach(enumDef => {
                schema += this.generateEnum(enumDef);
                schema += '\n\n';
            });
        }

        // Models
        project.models.forEach(model => {
            schema += this.generateModel(model, project.relations, project.databaseProvider);
            schema += '\n\n';
        });

        return schema.trim();
    }

    private static generateGeneratorBlock(config?: any): string {
        const provider = config?.provider || 'prisma-client';
        let block = `generator client {\n  provider = "${provider}"`;

        if (config?.previewFeatures && config.previewFeatures.length > 0) {
            block += `\n  previewFeatures = [${config.previewFeatures.map((f: string) => `"${f}"`).join(', ')}]`;
        }

        if (config?.output) {
            block += `\n  output = "${config.output}"`;
        }

        if (config?.engineType) {
            block += `\n  engineType = "${config.engineType}"`;
        }

        block += '\n}';
        return block;
    }

    private static generateDatasourceBlock(provider: DatabaseProvider, url: string): string {
        const providerLowercase = provider.toLowerCase();
        return `datasource db {\n  provider = "${providerLowercase}"\n}`;
    }

    private static generateEnum(enumDef: PrismaEnum): string {
        let block = `enum ${enumDef.name} {\n`;
        enumDef.values.forEach(value => {
            block += `  ${value}\n`;
        });
        block += '}';

        if (enumDef.mapName) {
            block = block.replace('}', `\n\n  @@map("${enumDef.mapName}")\n}`);
        }

        return block;
    }

    private static generateModel(
        model: PrismaModel,
        relations: PrismaRelation[],
        provider: DatabaseProvider
    ): string {
        if (model.ignore) {
            return `// ${model.name} model is ignored`;
        }

        let block = `model ${model.name} {\n`;

        // Fields
        model.fields.forEach(field => {
            if (!field.ignore) {
                block += '  ' + this.generateField(field, provider) + '\n';
            }
        });

        // Model-level attributes
        const modelAttributes = this.generateModelAttributes(model, relations);
        if (modelAttributes.length > 0) {
            block += '\n';
            modelAttributes.forEach(attr => {
                block += '  ' + attr + '\n';
            });
        }

        block += '}';
        return block;
    }

    private static generateField(field: PrismaField, provider: DatabaseProvider): string {
        let line = field.name;

        // Type
        line += ' ' + field.type;

        // Optional/Array modifiers
        if (field.isArray) line += '[]';
        if (field.isOptional && !field.isArray) line += '?';

        // Attributes
        const attributes: string[] = [];

        if (field.isId) attributes.push('@id');
        if (field.isUnique) attributes.push('@unique');
        if (field.isUpdatedAt) attributes.push('@updatedAt');

        if (field.defaultValue) {
            attributes.push(`@default(${field.defaultValue})`);
        }

        if (field.nativeType) {
            const nativeTypeStr = field.nativeType.args && field.nativeType.args.length > 0
                ? `${field.nativeType.type}(${field.nativeType.args.join(', ')})`
                : field.nativeType.type;
            attributes.push(`@db.${nativeTypeStr}`);
        }

        if (field.relationName || field.relationFields) {
            const relationParts: string[] = [];
            if (field.relationName) relationParts.push(`name: "${field.relationName}"`);
            if (field.relationFields) relationParts.push(`fields: [${field.relationFields.join(', ')}]`);
            if (field.relationReferences) relationParts.push(`references: [${field.relationReferences.join(', ')}]`);

            attributes.push(`@relation(${relationParts.join(', ')})`);
        }

        if (field.mapName) {
            attributes.push(`@map("${field.mapName}")`);
        }

        if (attributes.length > 0) {
            line += ' ' + attributes.join(' ');
        }

        return line;
    }

    private static generateModelAttributes(model: PrismaModel, relations: PrismaRelation[]): string[] {
        const attributes: string[] = [];

        if (model.compositeId && model.compositeId.length > 0) {
            attributes.push(`@@id([${model.compositeId.join(', ')}])`);
        }

        if (model.compositeUnique) {
            model.compositeUnique.forEach(unique => {
                attributes.push(`@@unique([${unique.join(', ')}])`);
            });
        }

        if (model.compositeIndex) {
            model.compositeIndex.forEach(index => {
                attributes.push(`@@index([${index.join(', ')}])`);
            });
        }

        if (model.fulltextIndex) {
            model.fulltextIndex.forEach(fulltext => {
                attributes.push(`@@fulltext([${fulltext.join(', ')}])`);
            });
        }

        if (model.mapName) {
            attributes.push(`@@map("${model.mapName}")`);
        }

        if (model.schema) {
            attributes.push(`@@schema("${model.schema}")`);
        }

        return attributes;
    }

    static generateRelationFields(
        relation: PrismaRelation,
        models: PrismaModel[]
    ): { fromField: Partial<PrismaField>, toField: Partial<PrismaField> } {
        const fromModel = models.find(m => m.id === relation.from.modelId);
        const toModel = models.find(m => m.id === relation.to.modelId);

        if (!fromModel || !toModel) {
            throw new Error('Related models not found');
        }

        const relationName = relation.name || `${fromModel.name}${toModel.name}`;

        switch (relation.type) {
            case 'ONE_TO_ONE':
                return {
                    fromField: {
                        name: toModel.name.toLowerCase(),
                        type: toModel.name,
                        isOptional: true,
                        relationName,
                        relationFields: [`${toModel.name.toLowerCase()}Id`],
                        relationReferences: ['id']
                    },
                    toField: {
                        name: `${toModel.name.toLowerCase()}Id`,
                        type: 'Int',
                        isUnique: true,
                        isOptional: true
                    }
                };

            case 'ONE_TO_MANY':
                return {
                    fromField: {
                        name: `${toModel.name.toLowerCase()}s`,
                        type: toModel.name,
                        isArray: true
                    },
                    toField: {
                        name: fromModel.name.toLowerCase(),
                        type: fromModel.name,
                        relationName,
                        relationFields: [`${fromModel.name.toLowerCase()}Id`],
                        relationReferences: ['id']
                    }
                };

            case 'MANY_TO_MANY':
                return {
                    fromField: {
                        name: `${toModel.name.toLowerCase()}s`,
                        type: toModel.name,
                        isArray: true
                    },
                    toField: {
                        name: `${fromModel.name.toLowerCase()}s`,
                        type: fromModel.name,
                        isArray: true
                    }
                };

            default:
                throw new Error(`Unsupported relation type: ${relation.type}`);
        }
    }
}

export function downloadPrismaSchema(schema: string, filename: string = 'schema.prisma') {
    const blob = new Blob([schema], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}