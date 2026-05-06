<?php

namespace Tests\Feature\Workspace;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class RegistrationWithInviteTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_with_valid_invite_token_auto_joins_workspace(): void
    {
        $workspace = Workspace::create(['name' => 'Test Workspace']);
        $owner = User::factory()->create();
        $workspace->users()->attach($owner->id, ['role' => 'owner']);

        $invitation = $workspace->invitations()->make([
            'token' => (string) Str::uuid(),
            'expires_at' => now()->addDays(7),
        ]);
        $invitation->created_by = $owner->id;
        $invitation->save();

        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'invite_token' => $invitation->token,
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));

        $user = User::where('email', 'test@example.com')->first();
        $this->assertNotNull($user);
        $this->assertTrue($user->workspaces()->where('workspace_id', $workspace->id)->exists());
        $this->assertEquals('editor', $user->workspaceRole($workspace));
    }

    public function test_register_with_invalid_invite_token_goes_to_onboarding(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'invite_token' => 'invalid-token-12345',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('onboarding', absolute: false));

        $user = User::where('email', 'test@example.com')->first();
        $this->assertNotNull($user);
        $this->assertFalse($user->hasWorkspaces());
    }

    public function test_register_without_invite_token_goes_to_onboarding(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('onboarding', absolute: false));

        $user = User::where('email', 'test@example.com')->first();
        $this->assertNotNull($user);
        $this->assertFalse($user->hasWorkspaces());
    }
}
