<?php

namespace Tests\Feature\Categories;

use App\Models\Category;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_category_is_workspace_scoped_and_available_through_workspace_relationship(): void
    {
        $workspace = Workspace::create(['name' => 'Workspace Financeiro']);

        $category = Category::factory()->create([
            'workspace_id' => $workspace->id,
            'name' => 'Moradia',
        ]);

        $this->assertSame('Moradia', $workspace->categories()->first()?->name);
        $this->assertSame($workspace->id, $category->workspace->id);
        $this->assertContains('name', $category->getFillable());
    }
}
