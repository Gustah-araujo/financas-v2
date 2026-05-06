<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
    $workspace = null;
    $workspaces = collect([]);

        if ($user) {
            $workspaces = $user->workspaces()
                ->orderBy('name')
                ->get()
                ->map(fn ($w) => [
                    'id' => $w->id,
                    'name' => $w->name,
                    'slug' => $w->slug,
                    'role' => $w->pivot->role,
                ]);

            $activeId = $request->session()->get('active_workspace_id');
            $workspace = $workspaces->firstWhere('id', $activeId);

            if (!$workspace && $workspaces->isNotEmpty()) {
                $workspace = $workspaces->first();
                $request->session()->put('active_workspace_id', $workspace['id']);
            }

            if ($workspace) {
                $request->attributes->set('active_workspace_id', $workspace['id']);
            }
        }

        return [
            ...parent::share($request),
            'auth' => ['user' => $user],
            'workspace' => $workspace,
            'workspaces' => is_object($workspaces) ? $workspaces->toArray() : $workspaces,
        ];
    }
}
