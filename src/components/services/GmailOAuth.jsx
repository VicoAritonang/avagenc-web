import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'

export default function GmailOAuth({ open, onOpenChange, onConnect }) {
    const [selectedScopes, setSelectedScopes] = useState(['read'])

    const scopes = [
        { id: 'read', label: 'Read emails', description: 'View your email messages and settings' },
        { id: 'label', label: 'Manage labels', description: 'Manage your email labels and categories' },
        { id: 'send', label: 'Send emails', description: 'Send emails on your behalf' }
    ]

    const toggleScope = (scopeId) => {
        setSelectedScopes(prev =>
            prev.includes(scopeId)
                ? prev.filter(s => s !== scopeId)
                : [...prev, scopeId]
        )
    }

    const handleConnect = () => {
        if (selectedScopes.length > 0) {
            onConnect(selectedScopes)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Connect Gmail</DialogTitle>
                    <DialogDescription>
                        Select the permissions you want to grant to Avagenc AI
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-4">
                    {scopes.map((scope) => (
                        <div
                            key={scope.id}
                            className="flex items-start space-x-3 p-4 rounded-lg hover:bg-slate-700/30 transition-colors cursor-pointer border border-slate-600/20 hover:border-slate-500/40"
                            onClick={() => toggleScope(scope.id)}
                        >
                            <Checkbox
                                id={scope.id}
                                checked={selectedScopes.includes(scope.id)}
                                onCheckedChange={() => toggleScope(scope.id)}
                                onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1">
                                <Label
                                    htmlFor={scope.id}
                                    className="text-base font-medium text-white cursor-pointer"
                                >
                                    {scope.label}
                                </Label>
                                <p className="text-sm text-gray-400 mt-1">{scope.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConnect}
                        disabled={selectedScopes.length === 0}
                    >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Continue with Google
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
