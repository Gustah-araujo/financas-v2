<?php

namespace Tests\Feature\Workspace;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class AcceptInviteTest extends TestCase
{
    use RefreshDatabase;

    private function createOwnerAndWorkspace(): array
    {
        $owner = User::factory()->create();
        $workspace = Workspace::create(['name' => 'Test Workspace']);
        $workspace->users()->attach($owner->id, ['role' => 'owner']);

        return [$owner, $workspace];
    }

    private function createInvitation(Workspace $workspace, User $owner, array $overrides = []): WorkspaceInvitation
    {
        $invitation = $workspace->invitations()->make([
            'token' => Str::uuid()->toString(),
            'expires_at' => $overrides['expires_at'] ?? now()->addDays(6),
        ]);
        $invitation->created_by = $owner->id;

        if (isset($overrides['accepted_at'])) {
            $invitation->accepted_at = $overrides['accepted_at'];
        }

        if (isset($overrides['cancelled_at'])) {
            $invitation->cancelled_at = $overrides['cancelled_at'];
        }

        $invitation->save();

        return $invitation;
    }

    public function test_authenticated_user_can_accept_valid_invite(): void
    {
        [$owner, $workspace] = $this->createOwnerAndWorkspace();
        $invitation = $this->createInvitation($workspace, $owner);

        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->post('/invite/' . $invitation->token . '/accept');

        $response->assertRedirect(route('dashboard', absolute: false));

        $this->assertDatabaseHas('workspace_user', [
            'user_id' => $user->id,
            'workspace_id' => $workspace->id,
            'role' => 'editor',
        ]);

        $this->assertNotNull($invitation->fresh()->accepted_at);
    }

    public function test_invalid_token_returns_404(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->post('/invite/invalid-token/accept');

        $response->assertNotFound();
    }

    public function test_expired_token_shows_error_on_show_page(): void
    {
        [$owner, $workspace] = $this->createOwnerAndWorkspace();
        $invitation = $this->createInvitation($workspace, $owner, [
            'expires_at' => now()->subDay(),
        ]);

        $this->withoutVite();

        $response = $this->get('/invite/' . $invitation->token);

        $response->assertInertia(fn ($page) =>
            $page->component('Invitation/Accept')
                ->where('status', 'expired')
        );
    }

    public function test_already_accepted_invite_shows_message_on_show_page(): void
    {
        [$owner, $workspace] = $this->createOwnerAndWorkspace();
        $invitation = $this->createInvitation($workspace, $owner, [
            'accepted_at' => now(),
        ]);

        $this->withoutVite();

        $response = $this->get('/invite/' . $invitation->token);

        $response->assertInertia(fn ($page) =>
            $page->component('Invitation/Accept')
                ->where('status', 'accepted')
        );
    }

    public function test_cancelled_invite_shows_cancelled_message_on_show_page(): void
    {
        [$owner, $workspace] = $this->createOwnerAndWorkspace();
        $invitation = $this->createInvitation($workspace, $owner, [
            'cancelled_at' => now(),
        ]);

        $this->withoutVite();

        $response = $this->get('/invite/' . $invitation->token);

        $response->assertInertia(fn ($page) =>
            $page->component('Invitation/Accept')
                ->where('status', 'cancelled')
        );
    }
}
