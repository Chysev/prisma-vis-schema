import React, { useState } from 'react'
import { useAuth } from '@/db/queries/useAuth'
import { Input } from '@/components/ui/input';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Register = () => {
    const navigate = useNavigate();
    const search = useSearch({ from: '/auth/register' }) as { redirect?: string };

    const [state, setState] = useState({
        email: '',
        password: '',
        error: ''
    })

    const { registerMutation } = useAuth()

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setState({ ...state, error: '' })

        try {
            await registerMutation.mutateAsync({
                email: state.email,
                password: state.password
            })

            const redirectTo = search.redirect || "/dashboard";
            navigate({ to: redirectTo })
        } catch (error) {
            setState({ ...state, error: 'Registration failed.' })
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Register</CardTitle>
                    <CardDescription className="text-center">
                        Create a new account to get started
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {state.error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{state.error}</AlertDescription>
                        </Alert>
                    )}
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="Email"
                                value={state.email}
                                onChange={(e) => setState({ ...state, email: e.target.value })}
                                required
                                disabled={registerMutation.isPending}
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Password"
                                value={state.password}
                                onChange={(e) => setState({ ...state, password: e.target.value })}
                                required
                                disabled={registerMutation.isPending}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={registerMutation.isPending}
                        >
                            {registerMutation.isPending ? 'Registering...' : 'Register'}
                        </Button>
                    </form>
                    <p className="mt-4 text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link to="/auth/login" className="text-primary underline underline-offset-4 hover:no-underline">
                            Login
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

export default Register