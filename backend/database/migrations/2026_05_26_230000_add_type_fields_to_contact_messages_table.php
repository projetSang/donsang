<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('contact_messages', function (Blueprint $table) {
            $table->string('type')->default('user')->after('id'); // 'hospital' or 'user'
            $table->string('phone')->nullable()->after('email');
            $table->string('hospital_name')->nullable()->after('phone');
            $table->string('city')->nullable()->after('hospital_name');
            $table->string('address')->nullable()->after('city');
            $table->string('status')->default('pending')->after('message'); // pending, approved, rejected
        });
    }

    public function down(): void {
        Schema::table('contact_messages', function (Blueprint $table) {
            $table->dropColumn(['type', 'phone', 'hospital_name', 'city', 'address', 'status']);
        });
    }
};
