<?php

namespace Tests\Feature\Workspace;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OnboardingGateTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_new_user_without_workspace_redirected_to_onboarding_from_dashboard(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get('/dashboard');

        $response->assertRedirect(route('onboarding'));
    }

    public function test_user_with_workspace_can_access_dashboard(): void
    {
        $user = User::factory()->create();
        $workspace = Workspace::create(['name' => 'Test Workspace']);
        $workspace->users()->attach($user->id, ['role' => 'owner']);
        session(['active_workspace_id' => $workspace->id]);

        $response = $this
            ->actingAs($user)
            ->get('/dashboard');

        $response->assertOk();
    }

    public function test_user_without_workspace_can_access_onboarding(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get('/onboarding');

        $response->assertOk();
    }

    public function test_user_with_workspace_redirected_from_onboarding_to_dashboard(): void
    {
        $user = User::factory()->create();
        $workspace = Workspace::create(['name' => 'Test Workspace']);
        $workspace->users()->attach($user->id, ['role' => 'owner']);

        $response = $this
            ->actingAs($user)
            ->get('/onboarding');

        $response->assertRedirect(route('dashboard'));
    }
}
