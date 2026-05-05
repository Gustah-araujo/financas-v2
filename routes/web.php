<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/ui-showcase', fn() => Inertia::render('UI/Showcase'));

Route::get('/api/ui-showcase-table', function () {
    $data = collect([
        ['id' => 1, 'description' => 'Salário', 'amount' => 500000, 'date' => '2026-05-01', 'category' => 'Receita'],
        ['id' => 2, 'description' => 'Aluguel', 'amount' => -150000, 'date' => '2026-05-02', 'category' => 'Moradia'],
        ['id' => 3, 'description' => 'Supermercado', 'amount' => -45000, 'date' => '2026-05-03', 'category' => 'Alimentação'],
        ['id' => 4, 'description' => 'Internet', 'amount' => -9990, 'date' => '2026-05-04', 'category' => 'Serviços'],
        ['id' => 5, 'description' => 'Freelance', 'amount' => 120000, 'date' => '2026-05-05', 'category' => 'Receita'],
    ]);

    return response()->json([
        'data' => $data->values(),
        'meta' => [
            'current_page' => 1,
            'last_page' => 1,
            'per_page' => 10,
            'total' => $data->count(),
            'from' => 1,
            'to' => $data->count(),
        ],
    ]);
});

require __DIR__.'/auth.php';
