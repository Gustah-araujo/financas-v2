<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\WorkspaceController;
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

Route::get('/invite/{token}', [InvitationController::class, 'show'])
    ->name('invitation.show');

Route::middleware('auth')->group(function () {
    Route::get('/onboarding', [OnboardingController::class, 'show'])
        ->name('onboarding');
    Route::post('/workspaces', [WorkspaceController::class, 'store'])
        ->name('workspaces.store');

    Route::post('/invite/{token}/accept', [InvitationController::class, 'accept'])
        ->name('invitation.accept');

    Route::get('/ui-showcase', fn () => Inertia::render('UI/Showcase'));
});

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

Route::middleware(['auth', 'workspace'])->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('Dashboard'))
        ->middleware('verified')
        ->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::prefix('/workspace')->name('workspace.')->group(function () {
        Route::get('/members', [MemberController::class, 'index'])
            ->name('members')
            ->middleware('can:manage-workspace-members');

        Route::post('/invite', [MemberController::class, 'invite'])
            ->name('invite')
            ->middleware('can:invite-to-workspace');

        Route::patch('/members/{user}', [MemberController::class, 'updateRole'])
            ->name('members.update-role')
            ->middleware('can:manage-workspace-members');

        Route::delete('/members/{user}', [MemberController::class, 'destroy'])
            ->name('members.destroy')
            ->middleware('can:manage-workspace-members');

        Route::delete('/invitations/{invitation}', [MemberController::class, 'cancelInvitation'])
            ->name('invitations.destroy')
            ->middleware('can:manage-workspace-members');
    });

    Route::post('/switch-workspace/{workspace}', [WorkspaceController::class, 'switch'])
        ->name('workspace.switch');

    Route::get('/accounts', [AccountController::class, 'index'])
        ->name('accounts.index')
        ->middleware('can:manage-financial-entities');
    Route::post('/accounts', [AccountController::class, 'store'])
        ->name('accounts.store')
        ->middleware('can:manage-financial-entities');
    Route::patch('/accounts/{account}', [AccountController::class, 'update'])
        ->name('accounts.update')
        ->middleware('can:manage-financial-entities');
    Route::delete('/accounts/{account}', [AccountController::class, 'destroy'])
        ->name('accounts.destroy')
        ->middleware('can:manage-financial-entities');

    Route::get('/transactions', [TransactionController::class, 'index'])
        ->name('transactions.index')
        ->middleware('can:manage-financial-entities');
    Route::put('/transactions/selected-account', [TransactionController::class, 'updateSelectedAccount'])
        ->name('transactions.selected-account.update')
        ->middleware('can:manage-financial-entities');

    Route::get('/api/accounts', [AccountController::class, 'apiIndex'])
        ->name('api.accounts.index')
        ->middleware('can:manage-financial-entities');
    Route::get('/api/accounts/{account}/transactions', [TransactionController::class, 'apiIndex'])
        ->name('api.accounts.transactions')
        ->middleware('can:manage-financial-entities');

    Route::post('/accounts/{account}/transactions', [TransactionController::class, 'store'])
        ->name('accounts.transactions.store')
        ->middleware('can:manage-financial-entities');
    Route::patch('/accounts/{account}/transactions/{transaction}', [TransactionController::class, 'update'])
        ->name('accounts.transactions.update')
        ->scopeBindings()
        ->middleware('can:manage-financial-entities');
    Route::delete('/accounts/{account}/transactions/{transaction}', [TransactionController::class, 'destroy'])
        ->name('accounts.transactions.destroy')
        ->scopeBindings()
        ->middleware('can:manage-financial-entities');
    Route::post('/accounts/{account}/transfer', [TransactionController::class, 'transfer'])
        ->name('accounts.transfer')
        ->middleware('can:manage-financial-entities');

    Route::get('/categories', [CategoryController::class, 'index'])
        ->name('categories.index')
        ->middleware('can:manage-financial-entities');
    Route::post('/categories', [CategoryController::class, 'store'])
        ->name('categories.store')
        ->middleware('can:manage-financial-entities');
    Route::patch('/categories/{category}', [CategoryController::class, 'update'])
        ->name('categories.update')
        ->middleware('can:manage-financial-entities');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])
        ->name('categories.destroy')
        ->middleware('can:manage-financial-entities');
});

require __DIR__.'/auth.php';
