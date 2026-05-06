<?php

namespace Tests\Unit;

use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkspaceSlugTest extends TestCase
{
    use RefreshDatabase;

    public function test_simple_name_generates_correct_slug(): void
    {
        $slug = Workspace::generateUniqueSlug('Minhas Finanças');

        $this->assertEquals('minhas-financas', $slug);
    }

    public function test_special_characters_are_removed(): void
    {
        $slug = Workspace::generateUniqueSlug('Casa & Família!');

        $this->assertEquals('casa-familia', $slug);
    }

    public function test_duplicate_slug_appends_dash_two(): void
    {
        Workspace::create(['name' => 'Minhas Finanças', 'slug' => 'minhas-financas']);

        $slug = Workspace::generateUniqueSlug('Minhas Finanças');

        $this->assertEquals('minhas-financas-2', $slug);
    }

    public function test_multiple_duplicates_increment_correctly(): void
    {
        Workspace::create(['name' => 'Minhas Finanças', 'slug' => 'minhas-financas']);
        Workspace::create(['name' => 'Minhas Finanças', 'slug' => 'minhas-financas-2']);

        $slug = Workspace::generateUniqueSlug('Minhas Finanças');

        $this->assertEquals('minhas-financas-3', $slug);
    }
}
