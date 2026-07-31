<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TranslatorService
{
    /**
     * Translates text to a target language code.
     */
    public static function translate($text, $targetCode)
    {
        // Disabled Google Translate API to prevent 3-12 second timeouts
        // when sending messages, making the chat experience much faster.
        return $text;
    }

    /**
     * Translates text to English, Indonesian, Chinese, and French.
     */
    public static function getTranslations($text)
    {
        $text = trim($text);
        if (!$text) {
            return [];
        }

        return [
            'en' => self::translate($text, 'en'),
            'id' => self::translate($text, 'id'),
            'zh' => self::translate($text, 'zh-CN'),
            'fr' => self::translate($text, 'fr'),
        ];
    }
}
