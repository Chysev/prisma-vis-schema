import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Database,
    Boxes,
    GitBranch,
    Zap,
    Shield,
    Code2,
    Workflow,
    ArrowRight,
    CheckCircle,
    Play,
    Eye,
    Palette
} from 'lucide-react'

const Home = () => {
    const features = [
        {
            icon: <Palette className="h-6 w-6" />,
            title: "Visual Schema Designer",
            description: "Intuitive drag-and-drop interface for creating database models and relationships with real-time validation."
        },
        {
            icon: <GitBranch className="h-6 w-6" />,
            title: "Smart Relationships",
            description: "Visual relationship mapping with support for 1:1, 1:N, and N:M relationships including optional constraints."
        },
        {
            icon: <Code2 className="h-6 w-6" />,
            title: "Live Schema Generation",
            description: "Real-time Prisma schema compilation with syntax validation and automatic type checking."
        },
        {
            icon: <Database className="h-6 w-6" />,
            title: "Multi-Database Support",
            description: "Support for MySQL, PostgreSQL, SQLite, MongoDB, and CockroachDB with provider-specific optimizations."
        },
        {
            icon: <Zap className="h-6 w-6" />,
            title: "Enum Integration",
            description: "Create and manage enums with automatic field type integration and visual connection indicators."
        },
        {
            icon: <Shield className="h-6 w-6" />,
            title: "Enterprise Security",
            description: "JWT authentication, API key management, and role-based access control for team collaboration."
        }
    ]

    const workflows = [
        {
            step: "01",
            title: "Design Your Schema",
            description: "Use the visual editor to create models, define fields, and establish relationships",
            icon: <Boxes className="h-5 w-5" />
        },
        {
            step: "02",
            title: "Configure Relationships",
            description: "Drag connections between models to create foreign key relationships",
            icon: <Workflow className="h-5 w-5" />
        },
        {
            step: "03",
            title: "Generate & Deploy",
            description: "Export your Prisma schema and run migrations directly from the interface",
            icon: <Play className="h-5 w-5" />
        }
    ]

    const stats = [
        { label: "Database Providers", value: "5+", icon: <Database className="h-4 w-4" /> },
        { label: "Field Types", value: "20+", icon: <Code2 className="h-4 w-4" /> },
        { label: "Relationship Types", value: "3", icon: <GitBranch className="h-4 w-4" /> },
        { label: "Schema Validation", value: "Real-time", icon: <CheckCircle className="h-4 w-4" /> }
    ]

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60 sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center space-x-2 shrink-0">
                            <Database className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                            <span className="text-lg sm:text-xl font-bold truncate">Prisma Schema Builder</span>
                        </div>
                        <nav className="hidden md:flex items-center space-x-6 flex-1 justify-center">
                            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
                                Features
                            </a>
                            <a href="#workflow" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
                                How it Works
                            </a>
                        </nav>
                        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
                            <Button variant="outline" size="sm" className="hidden sm:inline-flex" asChild>
                                <Link to="/auth/login">Login</Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link to="/auth/register">Get Started</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <section className="py-16 sm:py-24 lg:py-32">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8 max-w-5xl mx-auto">
                        <Badge variant="secondary" className="px-3 py-1.5 sm:px-4 sm:py-2">
                            <Zap className="h-3 w-3 mr-1" />
                            <span className="text-xs sm:text-sm">Visual Database Schema Design</span>
                        </Badge>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                            Design Database Schemas
                            <span className="text-primary block sm:inline"> Visually</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl leading-relaxed">
                            Create, manage, and deploy Prisma database schemas through an intuitive drag-and-drop interface.
                            From concept to production in minutes, not hours.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 w-full sm:w-auto">
                            <Button size="lg" className="text-base w-full sm:w-auto" asChild>
                                <Link to="/auth/register">
                                    Start Building
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="text-base w-full sm:w-auto" asChild>
                                <Link to="/dashboard">
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Editor
                                </Link>
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-8 sm:pt-12 w-full max-w-4xl">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center p-2 sm:p-4">
                                    <div className="flex justify-center mb-2 text-primary">
                                        {stat.icon}
                                    </div>
                                    <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                                    <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section id="features" className="py-16 sm:py-24 bg-muted/30">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                            Everything You Need for Schema Design
                        </h2>
                        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                            Professional-grade tools for database schema visualization, validation, and deployment
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {features.map((feature, index) => (
                            <Card key={index} className="border-2 hover:border-primary/20 transition-all duration-300">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                                        {feature.icon}
                                    </div>
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base leading-relaxed">
                                        {feature.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <section id="workflow" className="py-16 sm:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                            How It Works
                        </h2>
                        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                            From visual design to production deployment in three simple steps
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-8 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
                        {workflows.map((workflow, index) => (
                            <div key={index} className="text-center px-4">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary text-white rounded-full flex items-center justify-center text-lg sm:text-xl font-bold mx-auto mb-4 sm:mb-6">
                                    {workflow.step}
                                </div>
                                <div className="flex items-center justify-center mb-3 sm:mb-4">
                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                        {workflow.icon}
                                    </div>
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{workflow.title}</h3>
                                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{workflow.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 sm:py-24 bg-primary text-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                        Ready to Transform Your Database Design?
                    </h2>
                    <p className="text-lg sm:text-xl opacity-90 mb-8 max-w-3xl mx-auto leading-relaxed">
                        Join developers who are building better databases with visual schema design
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
                        <Button size="lg" variant="secondary" className="w-full sm:w-auto" asChild>
                            <Link to="/auth/register">
                                Get Started
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="ghost" className="text-white hover:bg-white/20 hover:text-white w-full sm:w-auto" asChild>
                            <Link to="/dashboard">
                                <Code2 className="mr-2 h-4 w-4" />
                                Open Editor
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            <footer className="border-t py-8 sm:py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                        <div className="flex items-center space-x-2">
                            <Database className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                            <span className="font-semibold text-sm sm:text-base">Prisma Schema Builder</span>
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                            Built with ❤️ by ChyDev
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Home