<?php

namespace App\Http\Controllers;

use App\Http\Requests\InviteMemberRequest;
use App\Http\Requests\UpdateMemberRoleRequest;
use App\Mail\WorkspaceInvitationMail;
use App\Models\User;
use App\Models\WorkspaceInvitation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class MemberController extends Controller
{
    public function index(Request $request): Response
    {
        $workspace = active_workspace();

        if (! $workspace) {
            abort(404);
        }

        Gate::authorize('manage-workspace-members');

        $members = $workspace->users()
            ->withPivot('role', 'created_at')
            ->get()
            ->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->pivot->role,
                'joined_at' => $user->pivot->created_at,
            ]);

        $pendingInvitations = $workspace->invitations()
            ->whereNull('accepted_at')
            ->whereNull('cancelled_at')
            ->where('expires_at', '>', now())
            ->with('createdBy')
            ->get()
            ->map(fn ($invitation) => [
                'id' => $invitation->id,
                'email' => $invitation->email,
                'token' => $invitation->token,
                'created_at' => $invitation->created_at,
                'expires_at' => $invitation->expires_at,
            ]);

        return Inertia::render('Workspace/Members', [
            'members' => $members,
            'pendingInvitations' => $pendingInvitations,
            'canManageMembers' => true,
        ]);
    }

    public function invite(InviteMemberRequest $request): JsonResponse
    {
        Gate::authorize('invite-to-workspace');

        $workspace = active_workspace();

        $invitation = $workspace->invitations()->make([
            'token' => (string) Str::uuid(),
            'email' => $request->email,
            'expires_at' => now()->addDays(7),
        ]);
        $invitation->created_by = $request->user()->id;
        $invitation->save();

        $inviteLink = route('invitation.show', $invitation->token);

        if ($request->email) {
            try {
                Mail::to($request->email)->send(new WorkspaceInvitationMail($invitation, $inviteLink));
            } catch (\Exception $e) {
                Log::error('Failed to send invitation email: ' . $e->getMessage());
            }
        }

        return response()->json([
            'invite_link' => $inviteLink,
            'token' => $invitation->token,
        ]);
    }

    public function updateRole(UpdateMemberRoleRequest $request, User $user): RedirectResponse
    {
        Gate::authorize('manage-workspace-members');

        $workspace = active_workspace();
        $isSelf = $request->user()->id === $user->id;
        $newRole = $request->role;

        if ($isSelf && $newRole === 'editor') {
            $ownerCount = $workspace->users()->wherePivot('role', 'owner')->count();
            if ($ownerCount <= 1) {
                return Redirect::back()->with('error', 'Workspace precisa ter pelo menos um proprietário.');
            }
        }

        $workspace->users()->updateExistingPivot($user->id, ['role' => $newRole]);

        return Redirect::back()->with('success', 'Papel atualizado com sucesso.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        Gate::authorize('manage-workspace-members');

        $workspace = active_workspace();

        if ($user->isOwnerOf($workspace)) {
            $ownerCount = $workspace->users()->wherePivot('role', 'owner')->count();
            if ($ownerCount <= 1) {
                return Redirect::back()->with('error', 'Workspace precisa ter pelo menos um proprietário.');
            }
        }

        $workspace->users()->detach($user->id);

        return Redirect::back()->with('success', 'Membro removido com sucesso.');
    }

    public function cancelInvitation(Request $request, WorkspaceInvitation $invitation): RedirectResponse
    {
        Gate::authorize('manage-workspace-members');

        $invitation->update(['cancelled_at' => now()]);

        return Redirect::back()->with('success', 'Convite cancelado.');
    }
}
