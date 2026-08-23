<?php
declare(strict_types=1);

require_once __DIR__ . '/template-ids.php';

function humanize_text(string $text): string
{
    $replacements = [
        '/\bunlock\b/i' => '',
        '/\belevate\b/i' => '',
        '/\brevolutionize\b/i' => '',
        '/\bgame[- ]?changer\b/i' => '',
        '/\bseamless\b/i' => 'smooth',
        '/\bcutting[- ]edge\b/i' => 'modern',
        '/\bworld[- ]class\b/i' => 'premium',
        '/\b—\b/' => '-',
        '/\s{2,}/' => ' ',
    ];
    $out = trim($text);
    foreach ($replacements as $pattern => $rep) {
        $out = preg_replace($pattern, $rep, $out) ?? $out;
    }
    return trim(preg_replace('/\s+([,.!?])/', '$1', $out) ?? $out);
}

function humanize_hashtags(string $tags): string
{
    $parts = preg_split('/\s+/', trim($tags)) ?: [];
    $out = [];
    foreach ($parts as $tag) {
        if ($tag === '') continue;
        $tag = str_starts_with($tag, '#') ? $tag : '#' . preg_replace('/[^a-zA-Z0-9]/', '', $tag);
        if (strlen($tag) > 2) $out[] = $tag;
    }
    return implode(' ', array_slice($out, 0, 12));
}

function curated_stock_photos(): array
{
    return [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=90',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=90',
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=90',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=90',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=90',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=90',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=90',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=90',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1600&q=90',
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&q=90',
    ];
}

/** Instant stock photo — no Unsplash API (OpenAI + Tavily only). */
function pick_curated_stock_photo(string $topic, string $keywords): array
{
    $photos = curated_stock_photos();
    $seed = abs(crc32(strtolower($topic . ' ' . $keywords)));
    return [
        'url' => $photos[$seed % count($photos)],
        'credit' => 'Stock photo',
    ];
}

function run_smart_fill(array $config, array $body): array
{
    if (empty($config['openai_api_key']) || empty($config['tavily_api_key'])) {
        throw new ApiException('Server missing API keys. Add keys to api/config.local.php', 503);
    }

    $topic = trim((string) ($body['topic'] ?? ''));
    if (strlen($topic) < 3) {
        throw new ApiException('Enter a topic (min 3 characters)');
    }

    $dna = is_array($body['companyDna'] ?? null) ? $body['companyDna'] : [];
    $exclude = is_array($body['excludeTemplates'] ?? null) ? $body['excludeTemplates'] : [];
    $language = (string) ($body['language'] ?? 'english');
    $platform = (string) ($body['platform'] ?? 'instagram');

    $search = http_post_json('https://api.tavily.com/search', [
        'api_key' => $config['tavily_api_key'],
        'query' => $topic . ' ' . ($dna['industry'] ?? '') . ' facts',
        'search_depth' => 'basic',
        'max_results' => 5,
        'include_answer' => true,
    ]);

    $research = (string) ($search['answer'] ?? '');
    if ($research === '' && !empty($search['results']) && is_array($search['results'])) {
        $chunks = array_map(fn ($r) => (string) ($r['content'] ?? ''), $search['results']);
        $research = substr(implode("\n", $chunks), 0, 1500);
    }
    if ($research === '') {
        $research = $topic;
    }

    $sources = [];
    if (!empty($search['results']) && is_array($search['results'])) {
        foreach (array_slice($search['results'], 0, 4) as $row) {
            if (!empty($row['url'])) $sources[] = (string) $row['url'];
        }
    }

    $templates = array_values(array_filter(studio_template_ids(), fn ($id) => !in_array($id, $exclude, true)));
    if (!$templates) $templates = studio_template_ids();

    $forbidden = array_merge($dna['forbiddenPhrases'] ?? [], ['unlock', 'elevate', 'revolutionize', 'game-changer', 'seamless experience']);
    $system = 'You are a senior brand designer and copywriter. Write human, factual copy — never robotic. '
        . 'Return ONLY valid JSON with keys: templateId, title, subtitle, description, eyebrow, badge, ctaText, '
        . 'propertyTitle, propertyPrice, propertyAddress, propertyBeds, propertyBaths, propertySqft, highlights (array), '
        . 'accentColor, secondaryColor, imageKeywords, captions (instagram, linkedin, whatsapp, facebook, twitter — each with caption and hashtags). '
        . 'templateId must be one of: ' . implode(', ', $templates) . '. '
        . 'Avoid clichés: ' . implode(', ', $forbidden) . '. '
        . 'Company: ' . json_encode($dna);

    $user = "Topic: {$topic}\nPlatform: {$platform}\nLanguage: {$language}\nResearch:\n{$research}\nSources: " . implode(' | ', $sources);

    $ai = http_post_json('https://api.openai.com/v1/chat/completions', [
        'model' => 'gpt-4o-mini',
        'messages' => [
            ['role' => 'system', 'content' => $system],
            ['role' => 'user', 'content' => $user],
        ],
        'response_format' => ['type' => 'json_object'],
        'temperature' => 0.85,
    ], ['Authorization: Bearer ' . $config['openai_api_key']]);

    $raw = $ai['choices'][0]['message']['content'] ?? '';
    $brief = json_decode((string) $raw, true);
    if (!is_array($brief)) {
        throw new ApiException('Empty AI response', 502);
    }

    foreach (['title', 'subtitle', 'description', 'eyebrow', 'badge', 'ctaText', 'propertyTitle', 'propertyAddress'] as $key) {
        if (!empty($brief[$key])) $brief[$key] = humanize_text((string) $brief[$key]);
    }
    if (!empty($brief['highlights']) && is_array($brief['highlights'])) {
        $brief['highlights'] = array_slice(array_map(fn ($h) => humanize_text((string) $h), $brief['highlights']), 0, 4);
    }
    if (!empty($dna['accentColor'])) $brief['accentColor'] = $dna['accentColor'];
    if (!empty($dna['secondaryColor'])) $brief['secondaryColor'] = $dna['secondaryColor'];
    if (!empty($brief['captions']) && is_array($brief['captions'])) {
        foreach ($brief['captions'] as &$cap) {
            if (!is_array($cap)) continue;
            if (!empty($cap['caption'])) $cap['caption'] = humanize_text((string) $cap['caption']);
            if (!empty($cap['hashtags'])) $cap['hashtags'] = humanize_hashtags((string) $cap['hashtags']);
        }
        unset($cap);
    }

    $imageUrl = null;
    $imageCredit = null;
    $keywords = (string) ($brief['imageKeywords'] ?? $topic);
    $photo = pick_curated_stock_photo($topic, $keywords);
    $imageUrl = $photo['url'];
    $imageCredit = $photo['credit'];

    return [
        'brief' => $brief,
        'researchSummary' => substr($research, 0, 400),
        'sources' => $sources,
        'imageUrl' => $imageUrl,
        'imageCredit' => $imageCredit,
    ];
}
