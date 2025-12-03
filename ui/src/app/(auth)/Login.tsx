import Cookies from "js-cookie";
import React, { useState } from 'react'
import { Input } from '@/components/ui/input';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { useAuth } from '@/db/queries/useAuth';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Login = () => {
    const navigate = useNavigate();
    const search = useSearch({ from: '/auth/login' }) as { redirect?: string };

    const [state, setState] = useState({
        email: '',
        password: '',
        error: ''
    })

    const { loginMutation } = useAuth()

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setState({ ...state, error: '' })

        try {
            const response = await loginMutation.mutateAsync({
                email: state.email,
                password: state.password
            })

            if (response.statusCode === 200) {
                Cookies.set(`${import.meta.env.VITE_TOKEN_NAME}`, response.data.token, { expires: 7 });
                setTimeout(() => {
                    const redirectTo = search.redirect || "/dashboard";
                    navigate({ to: redirectTo })
                }, 1000)
            }
        } catch (error) {
            setState({ ...state, error: 'Login failed.' })
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
                    <CardDescription className="text-center">
                        Enter your credentials to access your account
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
                                disabled={loginMutation.isPending}
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Password"
                                value={state.password}
                                onChange={(e) => setState({ ...state, password: e.target.value })}
                                required
                                disabled={loginMutation.isPending}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loginMutation.isPending}
                        >
                            {loginMutation.isPending ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>
                    <p className="mt-4 text-center text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <Link to="/auth/register" className="text-primary underline underline-offset-4 hover:no-underline">
                            Register
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

export default Login