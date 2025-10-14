<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Pharmacy;
use App\Models\Insurance;
use App\Observers\PharmacyObserver;
use App\Observers\InsuranceObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register observers for automatic insurance syncing
        Pharmacy::observe(PharmacyObserver::class);
        Insurance::observe(InsuranceObserver::class);
    }
}
