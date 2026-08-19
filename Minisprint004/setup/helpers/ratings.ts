const ASPECTS = {
    AmenitiesRate: [
        "pool",
        "gym",
        "spa",
        "sauna",
        "parking",
        "facility",
        "facilities"
    ],
    CleanlinessRate: [
        "clean",
        "dirty",
        "bathroom",
        "room",
        "smell"
    ],
    FoodBeverageRate: [
        "food",
        "restaurant",
        "breakfast",
        "buffet",
        "coffee",
        "bar"
    ],
    SleepQualityRate: [
        "bed",
        "sleep",
        "quiet",
        "noise",
        "pillow"
    ],
    InternetQualityRate: [
        "wifi",
        "wi-fi",
        "internet",
        "connection"
    ]
} as const;

const POSITIVE_WORDS = new Set([
    "clean",
    "comfortable",
    "great",
    "excellent",
    "amazing",
    "friendly",
    "helpful",
    "quiet",
    "good",
    "perfect",
    "nice",
    "fast",
    "reliable",
    "spacious",
    "pleasant",
    "lovely",
    "best"
]);

const NEGATIVE_WORDS = new Set([
    "dirty",
    "bad",
    "poor",
    "awful",
    "terrible",
    "noisy",
    "slow",
    "broken",
    "smell",
    "smelly",
    "uncomfortable",
    "rude",
    "crowded",
    "worst",
    "hate",
    "infested"
]);

export function clampRating(value: number): number {
    if (value < 1) {
        return 1;
    }

    if (value > 5) {
        return 5;
    }

    return Number(value.toFixed(2));
}

export function scoreAspect(
    text: string,
    keywords: readonly string[],
    baseRating: number
): number {
    if (!text) {
        return clampRating(baseRating);
    }

    const lower = text.toLowerCase();
    const mentionsAspect = keywords.some((keyword) =>
        lower.includes(keyword)
    );

    if (!mentionsAspect) {
        return clampRating(baseRating);
    }

    const tokens = lower
        .replace(/[^a-z0-9\s-]/g, " ")
        .split(/\s+/)
        .filter(Boolean);

    let delta = 0;

    for (const token of tokens) {
        if (POSITIVE_WORDS.has(token)) {
            delta += 1;
            continue;
        }

        if (NEGATIVE_WORDS.has(token)) {
            delta -= 1;
        }
    }

    const normalizedDelta = Math.max(-2, Math.min(2, delta / 4));

    return clampRating(baseRating + normalizedDelta);
}

export function buildAspectScores(text: string, baseRating: number):{AmenitiesRate: number; CleanlinessRate: number; FoodBeverageRate: number; SleepQualityRate: number; InternetQualityRate: number;} {
    return {
        AmenitiesRate: scoreAspect(text, ASPECTS.AmenitiesRate, baseRating),
        CleanlinessRate: scoreAspect(text, ASPECTS.CleanlinessRate, baseRating),
        FoodBeverageRate: scoreAspect(text, ASPECTS.FoodBeverageRate, baseRating),
        SleepQualityRate: scoreAspect(text, ASPECTS.SleepQualityRate, baseRating),
        InternetQualityRate: scoreAspect(text, ASPECTS.InternetQualityRate, baseRating)
    };
}