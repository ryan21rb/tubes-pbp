<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$doc = App\Models\Document::find(5);
if ($doc) {
    echo "ID: " . $doc->id . "\n";
    echo "Status: " . $doc->status . "\n";
    echo "Tahap Bantuan: " . $doc->tahap_bantuan . "\n";
    echo "Signed By: " . json_encode($doc->signed_by) . "\n";
} else {
    echo "Document with ID 5 not found.\n";
}
