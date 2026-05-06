<?php

namespace App\Http\Controllers;

use App\Models\WorkspaceInvitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class InvitationController extends Controller
{
    public function show(Request $request, string $token): Response
    {
        $invitation = WorkspaceInvitation::where('token', $token)->first();

        if (!$invitation) {
            abort(404, 'Convite não encontrado.');
        }

        $isAuthenticated = $request->user() !== null;
        $status = 'valid';

        if ($invitation->isCancelled()) {
            $status = 'cancelled';
        } elseif ($invitation->isExpired()) {
            $status = 'expired';
        } elseif ($invitation->isAccepted()) {
            $status = $isAuthenticated && $request->user()->workspaces()->where('workspace_id', $invitation->workspace_id)->exists()
                ? 'already_member'
                : 'accepted';
        }

        return Inertia::render('Invitation/Accept', [
            'workspaceName' => $invitation->workspace->name,
            'token' => $token,
            'status' => $status,
            'isAuthenticated' => $isAuthenticated,
        ]);
    }

    public function accept(Request $request, string $token): RedirectResponse
    {
        return DB::transaction(function () use ($request, $token) {
            $invitation = WorkspaceInvitation::where('token', $token)->lockForUpdate()->first();

            if (!$invitation) {
                abort(404, 'Convite não encontrado.');
            }

            if (!$invitation->isValid()) {
                abort(400, 'Este convite não é mais válido.');
            }

            $user = $request->user();
            if (!$user) {
                return Redirect::route('register', ['invite_token' => $token]);
            }

            if ($user->workspaces()->where('workspace_id', $invitation->workspace_id)->exists()) {
                $request->session()->put('active_workspace_id', $invitation->workspace_id);
                return Redirect::route('dashboard')->with('info', 'Você já faz parte deste workspace.');
            }

            $invitation->workspace->users()->attach($user->id, ['role' => 'editor']);
            $invitation->accepted_at = now();
            $invitation->save();

            $request->session()->put('active_workspace_id', $invitation->workspace_id);

            return Redirect::route('dashboard');
        });
    }
}
