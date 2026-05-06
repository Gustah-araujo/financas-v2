<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        if ($request->user()->hasWorkspaces()) {
            return Redirect::route('dashboard');
        }

        return Inertia::render('Onboarding');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $workspace = Workspace::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        $workspace->users()->attach($request->user()->id, ['role' => 'owner']);
        $request->session()->put('active_workspace_id', $workspace->id);

        return Redirect::route('dashboard');
    }
}
