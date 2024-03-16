const names = {
    "🎶": "musical_notes",
    "🎬": "clapper_board",
    "🎉": "party_popper",
    "❓": "question_mark",
    "✨": "sparkles",
    "🪅": "pinata",
    "🪄": "magic_wand",
    "🐲": "dragon_face",
    "🀄": "dragon_face_wukko",
    "💸": "money_with_wings",
    "⚙️": "gear",
    "📋": "clipboard",
    "🎃": "pumpkin",
    "🎄": "christmas_tree",
    "🕯️": "candle",
    "😺": "cat",
    "🐶": "dog",
    "🎂": "cake",
    "🐘": "elephant",
    "🐦": "bird",
    "🐙": "octopus",
    "🔮": "crystal_ball",
    "💪": "biceps",
    "💖": "sparkling_heart",
    "👾": "alien_monster",
    "😿": "cat_crying",
    "🙀": "cat_flabbergasted",
    "🐱": "cat_smile",
    "❤️‍🩹": "mending_heart",
    "🔒": "locked",
    "🔍": "magnifying_glass",
    "🔗": "link",
    "⌨": "keyboard",
    "📑": "boring_document",
    "🧮": "abacus",
    "😸": "cat_grin",
    "📰": "newspaper",
    "🎞️": "film_frames",
    "🎧": "headphone",
    "📧": "email",
    "📬": "mailbox",
    "📢": "loudspeaker",
    "🔧": "wrench",
    "🫧": "bubbles"
}
let sizing = {
    18: 0.8,
    22: 0.4,
    30: 0.7,
    32: 0.8,
    48: 0.9,
    64: 0.9,
    78: 0.9
}
export default function(emoji, size, disablePadding, fluent) {
    if (!size) size = 22;
    let padding = size !== 22 ? `margin-right:${sizing[size] ? sizing[size] : "0.4"}rem;` : false;
    if (disablePadding) padding = 'margin-right:0!important;';

    if (!names[emoji]) emoji = "❓";

    let filePath = `emoji/${names[emoji]}.svg`;
    if (fluent) filePath = `emoji/3d/${names[emoji]}.svg`;
    return `<img class="emoji" draggable=false height="${size}" width="${size}" ${padding ? `style="${padding}" ` : ''}alt="${emoji}" src="${filePath}" loading="lazy">`
}
