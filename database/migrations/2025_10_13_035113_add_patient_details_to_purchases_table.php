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
        Schema::table('purchases', function (Blueprint $table) {
            $table->string('patient_name')->nullable()->after('user_id');
            $table->string('patient_email')->nullable()->after('patient_name');
            $table->string('patient_phone', 20)->nullable()->after('patient_email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->dropColumn(['patient_name', 'patient_email', 'patient_phone']);
        });
    }
};
