<?php

namespace Tests\Feature\Workspace;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CreateWorkspaceTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_creates_workspace_with_valid_name(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->post('/workspaces', [
                'name' => 'My Workspace',
            ]);

        $response->assertRedirect(route('dashboard'));

        $this->assertDatabaseHas('workspaces', [
            'name' => 'My Workspace',
        ]);

        $workspace = Workspace::where('name', 'My Workspace')->first();
        $this->assertNotNull($workspace);
        $this->assertTrue($user->isOwnerOf($workspace));
    }

    public function test_slug_auto_generated_from_name(): void
    {
        $user = User::factory()->create();

        $this
            ->actingAs($user)
            ->post('/workspaces', [
                'name' => 'My Workspace',
            ]);

        $workspace = Workspace::where('name', 'My Workspace')->first();
        $this->assertNotNull($workspace);
        $this->assertSame('my-workspace', $workspace->slug);
    }

    public function test_slug_collision_appends_numeric_suffix(): void
    {
        $user = User::factory()->create();

        $this
            ->actingAs($user)
            ->post('/workspaces', [
                'name' => 'Test',
            ]);

        $this
            ->actingAs($user)
            ->post('/workspaces', [
                'name' => 'Test',
            ]);

        $workspaces = Workspace::where('name', 'Test')->orderBy('id')->get();
        $this->assertCount(2, $workspaces);
        $this->assertSame('test', $workspaces[0]->slug);
        $this->assertSame('test-2', $workspaces[1]->slug);
    }

    public function test_name_required_validation(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->post('/workspaces', [
                'name' => '',
            ]);

        $response->assertSessionHasErrors('name');
        $response->assertStatus(302);
    }

    public function test_name_max_255_validation(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->post('/workspaces', [
                'name' => str_repeat('a', 256),
            ]);

        $response->assertSessionHasErrors('name');
        $response->assertStatus(302);
    }

    public function test_onboarding_bypassed_if_user_has_workspaces(): void
    {
        $user = User::factory()->create();
        $workspace = Workspace::create([
            'name' => 'Existing Workspace',
            'slug' => 'existing-workspace',
        ]);
        $workspace->users()->attach($user->id, ['role' => 'owner']);

        $response = $this
            ->actingAs($user)
            ->get('/onboarding');

        $response->assertRedirect(route('dashboard'));
    }

    public function test_guest_cannot_access_onboarding(): void
    {
        $response = $this->get('/onboarding');

        $response->assertRedirect('/login');
    }
}
