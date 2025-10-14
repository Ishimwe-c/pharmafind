<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('insurance_pharmacy', function (Blueprint $table) {
            $table->decimal('coverage_percentage', 5, 2)->default(0)->after('insurance_id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('insurance_pharmacy', function (Blueprint $table) {
            $table->dropColumn(['coverage_percentage', 'created_at', 'updated_at']);
        });
    }
};
