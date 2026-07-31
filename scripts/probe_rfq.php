<?php
// Quick script to probe the RFQ request and then try a PUT
require __DIR__ . '/backend/vendor/autoload.php';
$app = require __DIR__ . '/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$app->make(Illuminate\Auth\AuthManager::class)->loginUsingId(2); // buyer user

$rfq = App\Models\RFQRequest::find('019fb827-de97-7159-bf55-934611c280b5');
if (!$rfq) {
    echo "RFQ NOT FOUND\n";
    exit;
}
echo "STATUS: " . $rfq->status . "\n";
echo "USER_ID: " . $rfq->user_id . "\n";
echo "QTY: " . $rfq->quantity . " (type: " . gettype($rfq->quantity) . ")\n";
echo "CATEGORY: " . $rfq->category . "\n";
echo "BUDGET: " . $rfq->budget_range . "\n";
echo "SHIPPING: " . $rfq->shipping_terms . "\n";
echo "PAYMENT: " . $rfq->payment_terms . "\n";
echo "DELIVERY: " . $rfq->delivery_timeline . "\n";
echo "UNIT: " . ($rfq->unit ?? 'NULL') . "\n";
echo "SUB_CAT: " . ($rfq->sub_category ?? 'NULL') . "\n";
echo "SPECS: " . ($rfq->specifications ?? 'NULL') . "\n";
echo "QUALITY: " . ($rfq->quality_requirements ?? 'NULL') . "\n";
echo "CERT: " . ($rfq->certifications ?? 'NULL') . "\n";
echo "IMAGES: " . ($rfq->image_urls ? count($rfq->image_urls) . ' items' : 'NULL') . "\n";
