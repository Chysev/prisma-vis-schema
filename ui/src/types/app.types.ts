import { z } from 'zod';

export const ApiErrorResponseSchema = z.object({
    message: z.string(),
    error: z.object({
        statusCode: z.number(),
        rawErrors: z.array(z.string()),
    }),
});

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

export type PrismaScalarType =
    | 'String' | 'Int' | 'BigInt' | 'Float' | 'Decimal' | 'Boolean'
    | 'DateTime' | 'Bytes' | 'Json';

export type DatabaseProvider =
    | 'POSTGRESQL' | 'MYSQL' | 'SQLITE' | 'SQLSERVER' | 'MONGODB' | 'COCKROACHDB';

export type PostgreSQLNativeType =
    | 'VarChar' | 'Char' | 'Text' | 'Uuid' | 'Xml' | 'JsonB'
    | 'Int4' | 'Int8' | 'Float4' | 'Float8' | 'Decimal' | 'Money'
    | 'Timestamp' | 'Timestamptz' | 'Date' | 'Time'
    | 'Inet' | 'Cidr' | 'Macaddr' | 'Bit' | 'VarBit';

export type MySQLNativeType =
    | 'VarChar' | 'Char' | 'TinyText' | 'Text' | 'MediumText' | 'LongText'
    | 'Int' | 'SmallInt' | 'TinyInt' | 'MediumInt' | 'BigInt' | 'Float' | 'Double' | 'Decimal'
    | 'Date' | 'DateTime' | 'Time' | 'Timestamp'
    | 'Json' | 'Blob' | 'LongBlob';

export type SQLiteNativeType = 'Text' | 'Integer' | 'Real' | 'Blob';

export type SQLServerNativeType =
    | 'Int' | 'BigInt' | 'SmallInt' | 'TinyInt' | 'Decimal' | 'Float'
    | 'VarChar' | 'NVarChar' | 'DateTime' | 'DateTime2' | 'Date' | 'Time' | 'UniqueIdentifier';

export type MongoDBNativeType =
    | 'ObjectId' | 'Int' | 'Long' | 'Double' | 'String' | 'Bool' | 'Date' | 'Decimal128' | 'Binary';

export type RelationType = 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_MANY';

export type PrismaField = {
    id: string;
    name: string;
    type: PrismaScalarType | string;
    isOptional: boolean;
    isArray: boolean;
    isId: boolean;
    isUnique: boolean;
    isUpdatedAt: boolean;
    defaultValue?: string;
    nativeType?: {
        type: string;
        args?: (string | number)[];
    };
    relationName?: string;
    relationFields?: string[];
    relationReferences?: string[];
    mapName?: string;
    ignore?: boolean;
}

export type PrismaModel = {
    id: string;
    name: string;
    fields: PrismaField[];
    mapName?: string;
    ignore?: boolean;
    compositeId?: string[];
    compositeUnique?: string[][];
    compositeIndex?: string[][];
    fulltextIndex?: string[][];
    schema?: string;
}

export type PrismaEnum = {
    id: string;
    name: string;
    values: string[];
    mapName?: string;
}

export type PrismaRelation = {
    id: string;
    type: RelationType;
    from: {
        modelId: string;
        fieldId: string;
    };
    to: {
        modelId: string;
        fieldId: string;
    };
    name?: string;
    onDelete?: 'CASCADE' | 'SET_NULL' | 'RESTRICT' | 'NO_ACTION' | 'SET_DEFAULT';
    onUpdate?: 'CASCADE' | 'SET_NULL' | 'RESTRICT' | 'NO_ACTION' | 'SET_DEFAULT';
}

export type PrismaProject = {
    id: string;
    name: string;
    databaseProvider: DatabaseProvider;
    databaseUrl: string;
    models: PrismaModel[];
    enums: PrismaEnum[];
    relations: PrismaRelation[];
    generatorConfig?: {
        provider: string;
        previewFeatures?: string[];
        output?: string;
        engineType?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export type DefaultValue = {
    type: 'autoincrement' | 'uuid' | 'cuid' | 'nanoid' | 'now' | 'literal' | 'dbgenerated';
    value?: string | number | boolean;
}

export const PRISMA_SCALAR_TYPES: PrismaScalarType[] = [
    'String', 'Int', 'BigInt', 'Float', 'Decimal', 'Boolean',
    'DateTime', 'Bytes', 'Json'
];

export const DATABASE_PROVIDERS: DatabaseProvider[] = [
    'MYSQL', 'SQLITE', 'SQLSERVER', 'MONGODB', 'COCKROACHDB', 'POSTGRESQL'
];

export const DEFAULT_FUNCTIONS = [
    'autoincrement()', 'uuid()', 'cuid()', 'nanoid()', 'now()', 'dbgenerated("")'
];

export const NATIVE_TYPE_MAP = {
    POSTGRESQL: [
        'VarChar(255)', 'Char(10)', 'Text', 'Uuid', 'Xml', 'JsonB',
        'Int4', 'Int8', 'Float4', 'Float8', 'Decimal(10,2)', 'Money',
        'Timestamp(3)', 'Timestamptz(3)', 'Date', 'Time(3)',
        'Inet', 'Cidr', 'Macaddr', 'Bit(1)', 'VarBit(10)'
    ],
    MYSQL: [
        'VarChar(255)', 'Char(10)', 'TinyText', 'Text', 'MediumText', 'LongText',
        'Int', 'SmallInt', 'TinyInt', 'MediumInt', 'BigInt', 'Float', 'Double', 'Decimal(10,2)',
        'Date', 'DateTime(3)', 'Time(3)', 'Timestamp(3)',
        'Json', 'Blob', 'LongBlob'
    ],
    SQLITE: ['Text', 'Integer', 'Real', 'Blob'],
    SQLSERVER: [
        'Int', 'BigInt', 'SmallInt', 'TinyInt', 'Decimal(10,2)', 'Float',
        'VarChar(255)', 'NVarChar(255)', 'DateTime', 'DateTime2', 'Date', 'Time', 'UniqueIdentifier'
    ],
    MONGODB: [
        'ObjectId', 'String', 'Bool', 'Int', 'Long', 'Double', 'Date', 'Binary'
    ],
    COCKROACHDB: [
        'String(255)', 'Char(10)', 'Text', 'Uuid',
        'Int2', 'Int4', 'Int8', 'Float4', 'Float8', 'Decimal(10,2)',
        'Timestamp(3)', 'Timestamptz(3)', 'Date', 'Time(3)', 'Timetz(3)',
        'Inet', 'Bit(1)', 'VarBit(10)', 'JsonB'
    ]
};