import type { LocaleCode } from "./locales";

/**
 * Every translatable string in the site chrome, homepage, editor,
 * FAQ and comparison copy, keyed by a dotted path (146 keys today).
 * `en` is the source of truth — every other language must carry the
 * exact same keys, which `getDictionary` falls back to per-key for, so
 * a half-translated language never shows a blank string.
 *
 * Scope today: nav, footer, homepage sections, the editor's field
 * labels and preview copy, FAQ and comparison tables. The invitation
 * engine's own fixed copy ("Scratch to reveal", "With love from", ...)
 * is a much larger follow-up pass — a couple's own typed
 * names/venue/dates are never translated either way, only the UI around
 * them.
 */
export type TranslationKey =
  | "nav.designs"
  | "nav.howItWorks"
  | "nav.pricing"
  | "nav.faq"
  | "nav.createYours"
  | "nav.signIn"
  | "nav.dashboard"
  | "nav.signOut"
  | "nav.openMenu"
  | "nav.closeMenu"
  | "nav.primaryLabel"
  | "footer.tagline"
  | "footer.explore"
  | "footer.policies"
  | "footer.terms"
  | "footer.privacy"
  | "footer.refunds"
  | "footer.contact"
  | "footer.copy"
  | "hero.eyebrow"
  | "hero.titleLine1"
  | "hero.titleOpenPrefix"
  | "hero.titleOpen"
  | "hero.titleLine3"
  | "hero.lede"
  | "hero.browseDesigns"
  | "hero.noteStrong"
  | "hero.noteRest"
  | "theme.preview"
  | "theme.useDesign"
  | "editor.design"
  | "editor.yourNames"
  | "editor.name"
  | "editor.partnersName"
  | "editor.families"
  | "editor.familiesNote"
  | "editor.firstSide"
  | "editor.secondSide"
  | "editor.parents"
  | "editor.grandparents"
  | "editor.qualifications"
  | "editor.openingText"
  | "editor.openingTextHint"
  | "editor.welcomeLine"
  | "editor.blessingOrVerse"
  | "editor.attribution"
  | "editor.theDay"
  | "editor.occasion"
  | "editor.dateAndTime"
  | "editor.venue"
  | "editor.googleMapsLink"
  | "editor.mapsHint"
  | "editor.yourFunctions"
  | "editor.addFunction"
  | "editor.replies"
  | "editor.whatsappNumber"
  | "editor.replyBy"
  | "editor.yourHashtag"
  | "editor.travelStay"
  | "editor.gettingThere"
  | "editor.whereToStay"
  | "editor.goodToKnow"
  | "editor.music"
  | "editor.photos"
  | "editor.yourStory"
  | "editor.lineForGuests"
  | "editor.togetherSince"
  | "editor.replayOpening"
  | "editor.previewNote"
  | "collection.eyebrow"
  | "collection.heading"
  | "collection.headingEm"
  | "collection.sub"
  | "collection.seeAll"
  | "how.eyebrow"
  | "how.heading"
  | "how.headingEm"
  | "steps.1.title"
  | "steps.1.body"
  | "steps.2.title"
  | "steps.2.body"
  | "steps.3.title"
  | "steps.3.body"
  | "compare.eyebrow"
  | "compare.heading"
  | "compare.headingEm"
  | "compare.headingSuffix"
  | "compare.colFeature"
  | "compare.colPaper"
  | "compare.colDigital"
  | "compare.row.cost.feature"
  | "compare.row.cost.paper"
  | "compare.row.cost.digital"
  | "compare.row.delivery.feature"
  | "compare.row.delivery.paper"
  | "compare.row.delivery.digital"
  | "compare.row.animation.feature"
  | "compare.row.music.feature"
  | "compare.row.countdown.feature"
  | "compare.row.editable.feature"
  | "compare.row.maps.feature"
  | "compare.row.guests.feature"
  | "compare.row.whatsapp.feature"
  | "pricing.eyebrow"
  | "pricing.heading1"
  | "pricing.heading2"
  | "pricing.body"
  | "pricing.theInvitation"
  | "pricing.oneTime"
  | "pricing.startCustomising"
  | "included.0"
  | "included.1"
  | "included.2"
  | "included.3"
  | "included.4"
  | "included.5"
  | "faq.eyebrow"
  | "faq.heading"
  | "faq.headingEm"
  | "faq.q0"
  | "faq.a0"
  | "faq.q1"
  | "faq.a1"
  | "faq.q2"
  | "faq.a2"
  | "faq.q3"
  | "faq.a3"
  | "faq.q4"
  | "faq.a4"
  | "faq.q5"
  | "faq.a5"
  | "faq.q6"
  | "faq.a6"
  | "faq.q7"
  | "faq.a7"
  | "faq.q8"
  | "faq.a8"
  | "faq.q9"
  | "faq.a9"
  | "faq.q10"
  | "faq.a10"
  | "closing.shubhVivah"
  | "closing.heading"
  | "closing.headingEm"
  | "closing.headingSuffix"
  | "closing.createYours";

type Dictionary = Record<TranslationKey, string>;

const en: Dictionary = {
  "nav.designs": "Designs",
  "nav.howItWorks": "How it works",
  "nav.pricing": "Pricing",
  "nav.faq": "FAQ",
  "nav.createYours": "Create yours",
  "nav.signIn": "Sign in",
  "nav.dashboard": "Dashboard",
  "nav.signOut": "Sign out",
  "nav.openMenu": "Open menu",
  "nav.closeMenu": "Close menu",
  "nav.primaryLabel": "Primary",
  "footer.tagline":
    "Animated wedding invitations for the phone in every guest's hand. No physical products are shipped.",
  "footer.explore": "Explore",
  "footer.policies": "Policies",
  "footer.terms": "Terms",
  "footer.privacy": "Privacy",
  "footer.refunds": "Refunds",
  "footer.contact": "Contact",
  "footer.copy": "Made with love, for love.",
  "hero.eyebrow": "Digital wedding invitations",
  "hero.titleLine1": "An invitation",
  "hero.titleOpenPrefix": "they'll ",
  "hero.titleOpen": "open",
  "hero.titleLine3": "twice.",
  "hero.lede":
    "Envelopes that unseal, palace doors that part, a date revealed under gold foil. Your own personalised webpage for your big day — shared in one WhatsApp link.",
  "hero.browseDesigns": "Browse {count} designs",
  "hero.noteStrong": "Unlimited customisation",
  "hero.noteRest": "always free",
  "theme.preview": "Preview",
  "theme.useDesign": "Use this design",
  "editor.design": "Design",
  "editor.yourNames": "Your names",
  "editor.name": "Name",
  "editor.partnersName": "Partner's name",
  "editor.families": "Families",
  "editor.familiesNote":
    "Indian invitations name the parents; leave blank to omit.",
  "editor.firstSide": "First side",
  "editor.secondSide": "Second side",
  "editor.parents": "Parents",
  "editor.grandparents": "Grandparents",
  "editor.qualifications": "Qualifications",
  "editor.openingText": "Opening text",
  "editor.openingTextHint":
    "Optional — most invitations open straight from the hero image into your names, which reads cleanest. Fill these in only if you want a line of text above them.",
  "editor.welcomeLine": "Welcome line",
  "editor.blessingOrVerse": "Blessing or verse",
  "editor.attribution": "Attribution",
  "editor.theDay": "The day",
  "editor.occasion": "Occasion",
  "editor.dateAndTime": "Date and time",
  "editor.venue": "Venue",
  "editor.googleMapsLink": "Google Maps link",
  "editor.mapsHint":
    "Optional — leave blank and tapping the venue name searches Google Maps for it automatically. Paste a link here only if you want guests sent to a specific pin instead.",
  "editor.yourFunctions": "Your functions",
  "editor.addFunction": "Add a function",
  "editor.replies": "Replies",
  "editor.whatsappNumber": "WhatsApp number",
  "editor.replyBy": "Reply by",
  "editor.yourHashtag": "Your hashtag",
  "editor.travelStay": "Travel & stay",
  "editor.gettingThere": "Getting there",
  "editor.whereToStay": "Where to stay",
  "editor.goodToKnow": "Good to know",
  "editor.music": "Music",
  "editor.photos": "Photos",
  "editor.yourStory": "Your story",
  "editor.lineForGuests": "A line for your guests",
  "editor.togetherSince": "Together since",
  "editor.replayOpening": "Replay the opening",
  "editor.previewNote":
    "This is a live preview — every change on the left shows up here instantly. Leave a field blank and it's simply left out of your invitation; no empty lines or placeholder text ever appear. Sample photos may appear in empty photo slots in this preview only — guests see those slots empty until you add your own photos.",
  "collection.eyebrow": "The collection",
  "collection.heading": "{count} ways to say",
  "collection.headingEm": "save the date",
  "collection.sub":
    "Each design is a complete animated experience — from the first tap to the final countdown.",
  "collection.seeAll": "See all {count} designs",
  "how.eyebrow": "How it works",
  "how.heading": "Ready in an",
  "how.headingEm": "evening",
  "steps.1.title": "Choose a design",
  "steps.1.body":
    "Browse {count} animated invitations — royal, modern, floral, destination. Preview each one exactly as your guests will.",
  "steps.2.title": "Customise, free",
  "steps.2.body":
    "Add your names, dates, venues, every function from haldi to reception, your photos and music. Edit as often as you like.",
  "steps.3.title": "Pay once, share",
  "steps.3.body":
    "Publish for ₹599 and get your own link. Send it on WhatsApp, Instagram, anywhere — it opens beautifully on any phone.",
  "compare.eyebrow": "Why go digital",
  "compare.heading": "Paper",
  "compare.headingEm": "vs",
  "compare.headingSuffix": "digital",
  "compare.colFeature": "Feature",
  "compare.colPaper": "Paper",
  "compare.colDigital": "Digital",
  "compare.row.cost.feature": "Cost",
  "compare.row.cost.paper": "₹150–₹500+ per card, plus printing",
  "compare.row.cost.digital": "₹599 one-time",
  "compare.row.delivery.feature": "Delivery time",
  "compare.row.delivery.paper": "1–2 weeks printing & courier",
  "compare.row.delivery.digital": "Instant",
  "compare.row.animation.feature": "Opening animation",
  "compare.row.music.feature": "Background music — yours or ours",
  "compare.row.countdown.feature": "Live countdown",
  "compare.row.editable.feature": "Editable after sending",
  "compare.row.maps.feature": "Google Maps directions",
  "compare.row.guests.feature": "Unlimited guests & shares",
  "compare.row.whatsapp.feature": "Shareable on WhatsApp",
  "pricing.eyebrow": "Pricing",
  "pricing.heading1": "One price.",
  "pricing.heading2": "No subscription.",
  "pricing.body":
    "Design and preview for as long as you like at no cost. Pay only when you're ready to share it with the world.",
  "pricing.theInvitation": "The invitation",
  "pricing.oneTime": "one-time",
  "pricing.startCustomising": "Start customising — free",
  "included.0": "Any of our {count} animated designs",
  "included.1": "Unlimited functions — mehendi to reception",
  "included.2": "Photo gallery, live countdown & music — yours or ours",
  "included.3": "Google Maps directions for every venue",
  "included.4": "Unlimited guests, unlimited shares",
  "included.5": "Edit details anytime after publishing",
  "faq.eyebrow": "Questions",
  "faq.heading": "Before you",
  "faq.headingEm": "begin",
  "faq.q0": "Is it really free to design?",
  "faq.a0":
    "Yes. Pick any design, add your names, dates and venues, and preview the whole thing on your own phone — all free. Adding your own photos or music just needs a free account. You only pay when you choose to publish.",
  "faq.q1": "What does the ₹599 actually pay for?",
  "faq.a1":
    "One invitation, published once, with its own shareable link — no watermark, no subscription, no per-guest charge. You can keep editing it after publishing, right up to the wedding.",
  "faq.q2": "Can I add mehendi, sangeet and reception separately?",
  "faq.a2":
    "Yes — add as many functions as you like, each with its own date, time, venue and dress code, all inside one invitation link.",
  "faq.q3": "Will it work for guests who aren't on WhatsApp?",
  "faq.a3":
    "The link is a normal web page, so it opens the same way over SMS, Instagram, email or any other app — WhatsApp is just the easiest way to send it.",
  "faq.q4": "Can I change details after I've shared the link?",
  "faq.a4":
    "Yes. Edit names, dates, venues or photos anytime before your event — the link stays the same, so guests always see the latest version.",
  "faq.q5": "Why ₹599?",
  "faq.a5":
    "That covers the cost of hosting your invitation and running the payment itself — servers and a payment gateway both charge per invitation. We're not trying to make much on top of that; we'd just rather you have a beautiful invitation than a free one that disappears in a month.",
  "faq.q6": "Can I use my own photos and music?",
  "faq.a6":
    "Yes. Upload your own photographs for the gallery, and either pick a track from our library or upload your own song — you'll need a free account, and uploads are saved to it as you add them, so they are there when you publish. One design, Dubai Silk, also comes with its own theme track; the other designs start silent until you choose music.",
  "faq.q7": "Is there a limit on guests or how many times the link is opened?",
  "faq.a7":
    "No. Share your link with as many guests as you like, on any number of groups — there's no guest cap and no limit on views.",
  "faq.q8": "Do guests need to install anything or sign up?",
  "faq.a8":
    "No. The link opens straight in their phone's browser — no app, no account, nothing to install.",
  "faq.q9": "What if I'm not happy with how it looks after publishing?",
  "faq.a9":
    "You can keep editing a published invitation at no extra cost. If something is genuinely broken, see our refund policy — we'll fix it or refund you.",
  "faq.q10": "Can I get help if I'm stuck?",
  "faq.a10":
    "Yes — reach us anytime from our contact page and we'll help you get your invitation ready.",
  "closing.shubhVivah": "Shubh Vivah",
  "closing.heading": "Begin with a",
  "closing.headingEm": "beautiful",
  "closing.headingSuffix": "hello.",
  "closing.createYours": "Create yours",
};

const hi: Dictionary = {
  "nav.designs": "डिज़ाइन",
  "nav.howItWorks": "यह कैसे काम करता है",
  "nav.pricing": "कीमत",
  "nav.faq": "सामान्य प्रश्न",
  "nav.createYours": "अपना बनाएं",
  "nav.signIn": "साइन इन",
  "nav.dashboard": "डैशबोर्ड",
  "nav.signOut": "साइन आउट",
  "nav.openMenu": "मेनू खोलें",
  "nav.closeMenu": "मेनू बंद करें",
  "nav.primaryLabel": "मुख्य",
  "footer.tagline":
    "हर मेहमान के फ़ोन के लिए एनिमेटेड शादी के निमंत्रण। कोई भौतिक सामान नहीं भेजा जाता।",
  "footer.explore": "देखें",
  "footer.policies": "नीतियां",
  "footer.terms": "नियम",
  "footer.privacy": "गोपनीयता",
  "footer.refunds": "रिफ़ंड",
  "footer.contact": "संपर्क करें",
  "footer.copy": "प्यार से बनाया गया, प्यार के लिए।",
  "hero.eyebrow": "डिजिटल शादी के निमंत्रण",
  "hero.titleLine1": "एक निमंत्रण",
  "hero.titleOpenPrefix": "जिसे वे ",
  "hero.titleOpen": "दो बार खोलेंगे",
  "hero.titleLine3": "",
  "hero.lede":
    "लिफ़ाफ़े जो खुलते हैं, महल के दरवाज़े जो अलग होते हैं, सोने की पन्नी के नीचे छुपी तारीख़। आपके ख़ास दिन के लिए आपका अपना निजी वेबपेज — एक व्हाट्सएप लिंक में साझा करें।",
  "hero.browseDesigns": "{count} डिज़ाइन देखें",
  "hero.noteStrong": "असीमित कस्टमाइज़ेशन",
  "hero.noteRest": "हमेशा मुफ़्त",
  "theme.preview": "पूर्वावलोकन",
  "theme.useDesign": "यह डिज़ाइन इस्तेमाल करें",
  "editor.design": "डिज़ाइन",
  "editor.yourNames": "आपके नाम",
  "editor.name": "नाम",
  "editor.partnersName": "साथी का नाम",
  "editor.families": "परिवार",
  "editor.familiesNote":
    "भारतीय निमंत्रणों में माता-पिता का नाम दिया जाता है; छोड़ना हो तो खाली रखें।",
  "editor.firstSide": "पहला पक्ष",
  "editor.secondSide": "दूसरा पक्ष",
  "editor.parents": "माता-पिता",
  "editor.grandparents": "दादा-दादी/नाना-नानी",
  "editor.qualifications": "योग्यताएं",
  "editor.openingText": "शुरुआती पाठ",
  "editor.openingTextHint":
    "वैकल्पिक — अधिकतर निमंत्रण मुख्य चित्र से सीधे नामों पर जाते हैं, जो सबसे साफ़ दिखता है। इन्हें तभी भरें जब आप नामों के ऊपर एक पंक्ति चाहते हों।",
  "editor.welcomeLine": "स्वागत पंक्ति",
  "editor.blessingOrVerse": "आशीर्वाद या छंद",
  "editor.attribution": "श्रेय",
  "editor.theDay": "दिन",
  "editor.occasion": "अवसर",
  "editor.dateAndTime": "तारीख़ और समय",
  "editor.venue": "स्थान",
  "editor.googleMapsLink": "गूगल मैप्स लिंक",
  "editor.mapsHint":
    "वैकल्पिक — खाली छोड़ें और स्थान के नाम पर टैप करने से अपने आप गूगल मैप्स पर खोज होगी। किसी खास पिन पर मेहमानों को भेजना हो तभी यहां लिंक डालें।",
  "editor.yourFunctions": "आपके कार्यक्रम",
  "editor.addFunction": "कार्यक्रम जोड़ें",
  "editor.replies": "जवाब",
  "editor.whatsappNumber": "व्हाट्सएप नंबर",
  "editor.replyBy": "इस तारीख़ तक जवाब दें",
  "editor.yourHashtag": "आपका हैशटैग",
  "editor.travelStay": "यात्रा और ठहराव",
  "editor.gettingThere": "वहां कैसे पहुंचें",
  "editor.whereToStay": "कहां ठहरें",
  "editor.goodToKnow": "जानना ज़रूरी",
  "editor.music": "संगीत",
  "editor.photos": "तस्वीरें",
  "editor.yourStory": "आपकी कहानी",
  "editor.lineForGuests": "मेहमानों के लिए एक पंक्ति",
  "editor.togetherSince": "साथ कब से हैं",
  "editor.replayOpening": "शुरुआत फिर से देखें",
  "editor.previewNote":
    "यह एक लाइव पूर्वावलोकन है — बाईं ओर किया गया हर बदलाव यहां तुरंत दिखता है। कोई फ़ील्ड खाली छोड़ें तो वह आपके निमंत्रण में बिल्कुल नहीं दिखेगी; कभी कोई खाली पंक्ति या प्लेसहोल्डर टेक्स्ट नहीं दिखता। नमूना तस्वीरें इस पूर्वावलोकन में केवल खाली फ़ोटो स्थानों में दिख सकती हैं — मेहमान वे स्थान खाली देखते हैं, जब तक आप अपनी तस्वीरें नहीं जोड़ते।",
  "collection.eyebrow": "संग्रह",
  "collection.heading": "{count} तरीके",
  "collection.headingEm": "सेव द डेट कहने के",
  "collection.sub":
    "हर डिज़ाइन एक पूरा एनिमेटेड अनुभव है — पहले टैप से लेकर आख़िरी उल्टी गिनती तक।",
  "collection.seeAll": "सभी {count} डिज़ाइन देखें",
  "how.eyebrow": "यह कैसे काम करता है",
  "how.heading": "एक",
  "how.headingEm": "शाम में तैयार",
  "steps.1.title": "एक डिज़ाइन चुनें",
  "steps.1.body":
    "{count} एनिमेटेड निमंत्रण देखें — शाही, आधुनिक, फूलों वाले, डेस्टिनेशन। हर एक को ठीक वैसे ही देखें जैसे आपके मेहमान देखेंगे।",
  "steps.2.title": "मुफ़्त में कस्टमाइज़ करें",
  "steps.2.body":
    "अपने नाम, तारीखें, स्थान, हल्दी से लेकर रिसेप्शन तक हर कार्यक्रम, अपनी तस्वीरें और संगीत जोड़ें। जितनी बार चाहें बदलें।",
  "steps.3.title": "एक बार भुगतान करें, साझा करें",
  "steps.3.body":
    "₹599 में प्रकाशित करें और अपना खुद का लिंक पाएं। इसे व्हाट्सएप, इंस्टाग्राम, कहीं भी भेजें — यह किसी भी फ़ोन पर खूबसूरती से खुलता है।",
  "compare.eyebrow": "डिजिटल क्यों चुनें",
  "compare.heading": "कागज़",
  "compare.headingEm": "बनाम",
  "compare.headingSuffix": "डिजिटल",
  "compare.colFeature": "सुविधा",
  "compare.colPaper": "कागज़",
  "compare.colDigital": "डिजिटल",
  "compare.row.cost.feature": "लागत",
  "compare.row.cost.paper": "₹150–₹500+ प्रति कार्ड, प्लस छपाई",
  "compare.row.cost.digital": "₹599 एक बार",
  "compare.row.delivery.feature": "डिलीवरी समय",
  "compare.row.delivery.paper": "1–2 हफ़्ते छपाई और कूरियर",
  "compare.row.delivery.digital": "तुरंत",
  "compare.row.animation.feature": "ओपनिंग एनिमेशन",
  "compare.row.music.feature": "बैकग्राउंड संगीत",
  "compare.row.countdown.feature": "लाइव उल्टी गिनती",
  "compare.row.editable.feature": "भेजने के बाद भी संपादन योग्य",
  "compare.row.maps.feature": "गूगल मैप्स दिशा-निर्देश",
  "compare.row.guests.feature": "असीमित मेहमान और शेयर",
  "compare.row.whatsapp.feature": "व्हाट्सएप पर साझा करने योग्य",
  "pricing.eyebrow": "कीमत",
  "pricing.heading1": "एक कीमत।",
  "pricing.heading2": "कोई सदस्यता नहीं।",
  "pricing.body":
    "जितना चाहें उतना डिज़ाइन और पूर्वावलोकन करें, बिना किसी लागत के। भुगतान तभी करें जब आप इसे दुनिया के साथ साझा करने के लिए तैयार हों।",
  "pricing.theInvitation": "निमंत्रण",
  "pricing.oneTime": "एक बार",
  "pricing.startCustomising": "मुफ़्त में कस्टमाइज़ करना शुरू करें",
  "included.0": "हमारे {count} एनिमेटेड डिज़ाइनों में से कोई भी",
  "included.1": "असीमित कार्यक्रम — हल्दी से रिसेप्शन तक",
  "included.2": "फ़ोटो गैलरी, संगीत और लाइव उल्टी गिनती",
  "included.3": "हर स्थान के लिए गूगल मैप्स दिशा-निर्देश",
  "included.4": "असीमित मेहमान, असीमित शेयर",
  "included.5": "प्रकाशित करने के बाद कभी भी विवरण बदलें",
  "faq.eyebrow": "सवाल",
  "faq.heading": "शुरू करने से",
  "faq.headingEm": "पहले",
  "faq.q0": "क्या डिज़ाइन करना सच में मुफ़्त है?",
  "faq.a0":
    "हां। कोई भी डिज़ाइन चुनें, अपने नाम, तारीखें और स्थान जोड़ें, और पूरी चीज़ अपने फ़ोन पर देखें — सब मुफ़्त। अपनी तस्वीरें या संगीत जोड़ने के लिए बस एक मुफ़्त खाता चाहिए। भुगतान तभी करना है जब आप प्रकाशित करना चाहें।",
  "faq.q1": "₹599 असल में किस चीज़ के लिए है?",
  "faq.a1":
    "एक निमंत्रण, एक बार प्रकाशित, अपने खुद के साझा करने योग्य लिंक के साथ — कोई वॉटरमार्क नहीं, कोई सदस्यता नहीं, प्रति-मेहमान कोई शुल्क नहीं। प्रकाशित करने के बाद भी, शादी तक आप इसे संपादित करते रह सकते हैं।",
  "faq.q2": "क्या मैं मेहंदी, संगीत और रिसेप्शन अलग-अलग जोड़ सकता/सकती हूं?",
  "faq.a2":
    "हां — जितने चाहें उतने कार्यक्रम जोड़ें, हर एक की अपनी तारीख़, समय, स्थान और ड्रेस कोड के साथ, सब एक ही निमंत्रण लिंक में।",
  "faq.q3": "क्या यह उन मेहमानों के लिए काम करेगा जो व्हाट्सएप पर नहीं हैं?",
  "faq.a3":
    "लिंक एक सामान्य वेब पेज है, इसलिए यह एसएमएस, इंस्टाग्राम, ईमेल या किसी भी अन्य ऐप पर उसी तरह खुलता है — व्हाट्सएप इसे भेजने का बस सबसे आसान तरीका है।",
  "faq.q4": "क्या लिंक साझा करने के बाद मैं विवरण बदल सकता/सकती हूं?",
  "faq.a4":
    "हां। अपने कार्यक्रम से पहले कभी भी नाम, तारीखें, स्थान या तस्वीरें बदलें — लिंक वही रहता है, इसलिए मेहमानों को हमेशा नवीनतम संस्करण दिखता है।",
  "faq.q5": "₹599 ही क्यों?",
  "faq.a5":
    "यह आपके निमंत्रण को होस्ट करने और भुगतान चलाने की लागत को कवर करता है — सर्वर और पेमेंट गेटवे दोनों प्रति निमंत्रण शुल्क लेते हैं। हम इसके ऊपर ज़्यादा कमाने की कोशिश नहीं कर रहे; हम बस चाहते हैं कि आपके पास एक महीने में गायब होने वाले मुफ़्त निमंत्रण के बजाय एक खूबसूरत निमंत्रण हो।",
  "faq.q6": "क्या मैं अपनी तस्वीरें और संगीत इस्तेमाल कर सकता/सकती हूं?",
  "faq.a6":
    "हां। गैलरी के लिए अपनी तस्वीरें अपलोड करें, और या तो हमारी लाइब्रेरी से कोई ट्रैक चुनें या अपना खुद का गाना अपलोड करें — अपलोड आपके खाते में सहेजे जाते हैं, इसलिए जब आप प्रकाशित करते हैं तो वे वहाँ मौजूद होते हैं। एक डिज़ाइन, दुबई सिल्क, अपने खुद के थीम ट्रैक के साथ आता है; बाकी डिज़ाइन तब तक शांत रहते हैं जब तक आप संगीत नहीं चुनते।",
  "faq.q7": "क्या मेहमानों की संख्या या लिंक खोलने की संख्या पर कोई सीमा है?",
  "faq.a7":
    "नहीं। अपना लिंक जितने चाहें उतने मेहमानों के साथ, किसी भी संख्या के ग्रुप में साझा करें — कोई मेहमान सीमा नहीं और देखने की कोई सीमा नहीं।",
  "faq.q8": "क्या मेहमानों को कुछ इंस्टॉल करने या साइन अप करने की ज़रूरत है?",
  "faq.a8":
    "नहीं। लिंक सीधे उनके फ़ोन के ब्राउज़र में खुलता है — कोई ऐप नहीं, कोई अकाउंट नहीं, कुछ भी इंस्टॉल करने की ज़रूरत नहीं।",
  "faq.q9": "अगर प्रकाशित करने के बाद मुझे यह अच्छा न लगे तो?",
  "faq.a9":
    "आप बिना किसी अतिरिक्त लागत के प्रकाशित निमंत्रण को संपादित करते रह सकते हैं। अगर वाकई कुछ ख़राब है, तो हमारी रिफ़ंड नीति देखें — हम इसे ठीक करेंगे या आपको रिफ़ंड देंगे।",
  "faq.q10": "अगर मैं फंस जाऊं तो क्या मुझे मदद मिल सकती है?",
  "faq.a10":
    "हां — हमारे संपर्क पेज से कभी भी हमसे संपर्क करें और हम आपका निमंत्रण तैयार करने में मदद करेंगे।",
  "closing.shubhVivah": "शुभ विवाह",
  "closing.heading": "एक",
  "closing.headingEm": "खूबसूरत",
  "closing.headingSuffix": "सलाम से शुरुआत करें।",
  "closing.createYours": "अपना बनाएं",
};

const ar: Dictionary = {
  "nav.designs": "التصاميم",
  "nav.howItWorks": "كيف يعمل",
  "nav.pricing": "الأسعار",
  "nav.faq": "الأسئلة الشائعة",
  "nav.createYours": "أنشئ دعوتك",
  "nav.signIn": "تسجيل الدخول",
  "nav.dashboard": "لوحة التحكم",
  "nav.signOut": "تسجيل الخروج",
  "nav.openMenu": "افتح القائمة",
  "nav.closeMenu": "أغلق القائمة",
  "nav.primaryLabel": "التنقل الرئيسي",
  "footer.tagline":
    "دعوات زفاف متحركة لهاتف كل ضيف. لا يتم شحن أي منتجات مادية.",
  "footer.explore": "استكشف",
  "footer.policies": "السياسات",
  "footer.terms": "الشروط",
  "footer.privacy": "الخصوصية",
  "footer.refunds": "الاسترداد",
  "footer.contact": "تواصل معنا",
  "footer.copy": "صُنع بحب، من أجل الحب.",
  "hero.eyebrow": "دعوات زفاف رقمية",
  "hero.titleLine1": "دعوة",
  "hero.titleOpenPrefix": "",
  "hero.titleOpen": "سيفتحونها",
  "hero.titleLine3": "مرتين.",
  "hero.lede":
    "أظرف تُفتح، وأبواب قصر تنفرج، وتاريخ يُكشف تحت رقاقة ذهبية. صفحتك الخاصة والمخصصة ليومك الكبير — تُشارَك برابط واحد على واتساب.",
  "hero.browseDesigns": "تصفّح {count} تصميمًا",
  "hero.noteStrong": "تخصيص غير محدود",
  "hero.noteRest": "مجانًا دائمًا",
  "theme.preview": "معاينة",
  "theme.useDesign": "استخدم هذا التصميم",
  "editor.design": "التصميم",
  "editor.yourNames": "أسماؤكما",
  "editor.name": "الاسم",
  "editor.partnersName": "اسم الشريك",
  "editor.families": "العائلتان",
  "editor.familiesNote":
    "الدعوات الهندية تذكر أسماء الوالدين؛ اتركه فارغًا لتجاهله.",
  "editor.firstSide": "الطرف الأول",
  "editor.secondSide": "الطرف الثاني",
  "editor.parents": "الوالدان",
  "editor.grandparents": "الأجداد",
  "editor.qualifications": "المؤهلات",
  "editor.openingText": "نص الافتتاح",
  "editor.openingTextHint":
    "اختياري — معظم الدعوات تنتقل مباشرة من الصورة الرئيسية إلى الأسماء، وهو الأنظف. املأ هذا فقط إذا أردت سطرًا فوق الأسماء.",
  "editor.welcomeLine": "سطر الترحيب",
  "editor.blessingOrVerse": "دعاء أو بيت شعر",
  "editor.attribution": "نُسب إلى",
  "editor.theDay": "اليوم",
  "editor.occasion": "المناسبة",
  "editor.dateAndTime": "التاريخ والوقت",
  "editor.venue": "المكان",
  "editor.googleMapsLink": "رابط خرائط جوجل",
  "editor.mapsHint":
    "اختياري — اتركه فارغًا وسيبحث النقر على اسم المكان في خرائط جوجل تلقائيًا. الصق رابطًا هنا فقط إذا أردت توجيه الضيوف إلى نقطة محددة.",
  "editor.yourFunctions": "فعالياتكما",
  "editor.addFunction": "إضافة فعالية",
  "editor.replies": "الردود",
  "editor.whatsappNumber": "رقم واتساب",
  "editor.replyBy": "الرد قبل",
  "editor.yourHashtag": "هاشتاغكما",
  "editor.travelStay": "السفر والإقامة",
  "editor.gettingThere": "كيفية الوصول",
  "editor.whereToStay": "مكان الإقامة",
  "editor.goodToKnow": "معلومة مفيدة",
  "editor.music": "الموسيقى",
  "editor.photos": "الصور",
  "editor.yourStory": "قصتكما",
  "editor.lineForGuests": "سطر للضيوف",
  "editor.togetherSince": "معًا منذ",
  "editor.replayOpening": "إعادة مشاهدة الافتتاح",
  "editor.previewNote":
    "هذه معاينة حية — كل تغيير على اليسار يظهر هنا فورًا. إذا تركت حقلًا فارغًا، فلن يظهر في دعوتك؛ لا تظهر أبدًا أسطر فارغة أو نص بديل. قد تظهر صور نموذجية في خانات الصور الفارغة في هذه المعاينة فقط — يرى الضيوف تلك الخانات فارغة حتى تضيف صورك الخاصة.",
  "collection.eyebrow": "المجموعة",
  "collection.heading": "{count} طريقة لقول",
  "collection.headingEm": "احفظوا التاريخ",
  "collection.sub":
    "كل تصميم هو تجربة متحركة كاملة — من أول لمسة حتى العد التنازلي الأخير.",
  "collection.seeAll": "عرض كل {count} تصميمًا",
  "how.eyebrow": "كيف يعمل",
  "how.heading": "جاهزة في",
  "how.headingEm": "أمسية واحدة",
  "steps.1.title": "اختر تصميمًا",
  "steps.1.body":
    "تصفّح {count} دعوة متحركة — ملكية، عصرية، زهرية، أو لوجهة سفر. عاين كل واحدة تمامًا كما سيراها ضيوفك.",
  "steps.2.title": "خصّصها مجانًا",
  "steps.2.body":
    "أضف أسماءكما، التواريخ، الأماكن، كل فعالية من الحناء إلى الاستقبال، صوركما وموسيقاكما. عدّل بقدر ما تشاء.",
  "steps.3.title": "ادفع مرة، شارك",
  "steps.3.body":
    "انشرها مقابل ٥٩٩ روبية واحصل على رابطك الخاص. أرسله عبر واتساب أو إنستغرام أو أي مكان — يفتح بشكل جميل على أي هاتف.",
  "compare.eyebrow": "لماذا الرقمي",
  "compare.heading": "الورق",
  "compare.headingEm": "مقابل",
  "compare.headingSuffix": "الرقمي",
  "compare.colFeature": "الميزة",
  "compare.colPaper": "الورق",
  "compare.colDigital": "الرقمي",
  "compare.row.cost.feature": "التكلفة",
  "compare.row.cost.paper": "١٥٠–٥٠٠+ روبية للبطاقة، إضافة للطباعة",
  "compare.row.cost.digital": "٥٩٩ روبية مرة واحدة",
  "compare.row.delivery.feature": "وقت التسليم",
  "compare.row.delivery.paper": "١-٢ أسبوع للطباعة والشحن",
  "compare.row.delivery.digital": "فوري",
  "compare.row.animation.feature": "رسوم الافتتاح المتحركة",
  "compare.row.music.feature": "موسيقى خلفية",
  "compare.row.countdown.feature": "عداد تنازلي مباشر",
  "compare.row.editable.feature": "قابلة للتعديل بعد الإرسال",
  "compare.row.maps.feature": "اتجاهات خرائط جوجل",
  "compare.row.guests.feature": "ضيوف ومشاركات غير محدودة",
  "compare.row.whatsapp.feature": "قابلة للمشاركة على واتساب",
  "pricing.eyebrow": "السعر",
  "pricing.heading1": "سعر واحد.",
  "pricing.heading2": "بلا اشتراك.",
  "pricing.body":
    "صمّم وعاين بقدر ما تشاء دون أي تكلفة. ادفع فقط عندما تكون جاهزًا لمشاركتها مع العالم.",
  "pricing.theInvitation": "الدعوة",
  "pricing.oneTime": "مرة واحدة",
  "pricing.startCustomising": "ابدأ التخصيص مجانًا",
  "included.0": "أي من تصاميمنا المتحركة الـ{count}",
  "included.1": "فعاليات غير محدودة — من الحناء إلى الاستقبال",
  "included.2": "معرض صور وموسيقى وعداد تنازلي مباشر",
  "included.3": "اتجاهات خرائط جوجل لكل مكان",
  "included.4": "ضيوف غير محدودين، مشاركات غير محدودة",
  "included.5": "عدّل التفاصيل في أي وقت بعد النشر",
  "faq.eyebrow": "أسئلة",
  "faq.heading": "قبل أن",
  "faq.headingEm": "تبدآ",
  "faq.q0": "هل التصميم مجاني حقًا؟",
  "faq.a0":
    "نعم. اختر أي تصميم، أضف أسماءكما والتواريخ والأماكن، وعاين كل شيء على هاتفك — مجانًا بالكامل. إضافة صورك أو موسيقاك الخاصة تحتاج فقط إلى حساب مجاني. تدفع فقط عندما تختار النشر.",
  "faq.q1": "فيم تُستخدم الـ٥٩٩ روبية فعليًا؟",
  "faq.a1":
    "دعوة واحدة، تُنشر مرة واحدة، برابط خاص قابل للمشاركة — بلا علامة مائية، بلا اشتراك، بلا رسوم لكل ضيف. يمكنك الاستمرار في التعديل بعد النشر، حتى يوم الزفاف.",
  "faq.q2": "هل يمكنني إضافة الحناء والسنغيت والاستقبال بشكل منفصل؟",
  "faq.a2":
    "نعم — أضف أي عدد تريده من الفعاليات، كل منها بتاريخه ووقته ومكانه وقواعد لباسه الخاصة، كلها داخل رابط دعوة واحد.",
  "faq.q3": "هل تعمل للضيوف غير المستخدمين لواتساب؟",
  "faq.a3":
    "الرابط صفحة ويب عادية، فتُفتح بنفس الطريقة عبر الرسائل النصية أو إنستغرام أو البريد الإلكتروني أو أي تطبيق آخر — واتساب هو فقط أسهل طريقة لإرسالها.",
  "faq.q4": "هل يمكنني تغيير التفاصيل بعد مشاركة الرابط؟",
  "faq.a4":
    "نعم. عدّل الأسماء أو التواريخ أو الأماكن أو الصور في أي وقت قبل مناسبتك — يبقى الرابط كما هو، فيرى الضيوف دائمًا أحدث نسخة.",
  "faq.q5": "لماذا ٥٩٩ روبية؟",
  "faq.a5":
    "هذا يغطي تكلفة استضافة دعوتك وتشغيل عملية الدفع نفسها — الخوادم وبوابة الدفع كلاهما يتقاضيان رسومًا لكل دعوة. نحن لا نحاول الربح الكبير فوق ذلك؛ نفضّل أن تحصل على دعوة جميلة بدلًا من دعوة مجانية تختفي خلال شهر.",
  "faq.q6": "هل يمكنني استخدام صوري وموسيقاي الخاصة؟",
  "faq.a6":
    "نعم. ارفع صورك الخاصة للمعرض، واختر مقطوعة من مكتبتنا أو ارفع أغنيتك الخاصة — تُحفظ التحميلات في حسابك، لذا فهي موجودة عندما تنشر. يأتي تصميم واحد، دبي سيلك، بمقطوعته الموسيقية الخاصة؛ بينما تبقى التصاميم الأخرى صامتة حتى تختار الموسيقى.",
  "faq.q7": "هل هناك حد لعدد الضيوف أو مرات فتح الرابط؟",
  "faq.a7":
    "لا. شارك رابطك مع أي عدد تريده من الضيوف، في أي عدد من المجموعات — لا يوجد حد للضيوف ولا حد للمشاهدات.",
  "faq.q8": "هل يحتاج الضيوف لتثبيت شيء أو التسجيل؟",
  "faq.a8":
    "لا. يفتح الرابط مباشرة في متصفح هاتفهم — بلا تطبيق، بلا حساب، لا شيء يحتاج للتثبيت.",
  "faq.q9": "ماذا لو لم يعجبني شكلها بعد النشر؟",
  "faq.a9":
    "يمكنك الاستمرار في تعديل الدعوة المنشورة دون أي تكلفة إضافية. إذا كان هناك خلل حقيقي، راجع سياسة الاسترداد لدينا — سنصلحه أو نرد لك المبلغ.",
  "faq.q10": "هل يمكنني الحصول على مساعدة إذا واجهت مشكلة؟",
  "faq.a10":
    "نعم — تواصل معنا في أي وقت من صفحة التواصل وسنساعدك في تجهيز دعوتك.",
  "closing.shubhVivah": "شُبه ويواه",
  "closing.heading": "ابدآ",
  "closing.headingEm": "بتحية جميلة",
  "closing.headingSuffix": "",
  "closing.createYours": "أنشئ دعوتك",
};

const mr: Partial<Dictionary> = {
  "nav.designs": "डिझाइन्स",
  "nav.howItWorks": "हे कसे कार्य करते",
  "nav.pricing": "किंमत",
  "nav.faq": "सामान्य प्रश्न",
  "nav.createYours": "तुमचे तयार करा",
  "nav.signIn": "साइन इन करा",
  "nav.dashboard": "डॅशबोर्ड",
  "nav.signOut": "साइन आउट करा",
  "nav.openMenu": "मेनू उघडा",
  "nav.closeMenu": "मेनू बंद करा",
  "nav.primaryLabel": "मुख्य",
  "footer.tagline":
    "प्रत्येक पाहुण्याच्या फोनसाठी अ‍ॅनिमेटेड लग्न आमंत्रणे. कोणतीही भौतिक वस्तू पाठवली जात नाही.",
  "footer.explore": "एक्सप्लोर करा",
  "footer.policies": "धोरणे",
  "footer.terms": "अटी",
  "footer.privacy": "गोपनीयता",
  "footer.refunds": "परतावा",
  "footer.contact": "संपर्क",
  "footer.copy": "प्रेमाने तयार केले, प्रेमासाठी.",
  "hero.eyebrow": "डिजिटल लग्न आमंत्रणे",
  "hero.titleLine1": "एक आमंत्रण",
  "hero.titleOpenPrefix": "जे ते ",
  "hero.titleOpen": "दोनदा उघडतील",
  "hero.titleLine3": "",
  "hero.lede":
    "उघडणारी पाकिटे, वेगळी होणारी राजवाड्याची दारे, सोनेरी फॉइलखाली उलगडणारी तारीख. तुमच्या खास दिवसासाठी तुमचे स्वतःचे वैयक्तिक वेबपेज — एका व्हॉट्सअ‍ॅप लिंकमध्ये शेअर करा.",
  "hero.browseDesigns": "{count} डिझाइन्स पहा",
  "hero.noteStrong": "अमर्यादित कस्टमायझेशन",
  "hero.noteRest": "कायम मोफत",
  "theme.preview": "पूर्वावलोकन",
  "theme.useDesign": "हे डिझाइन वापरा",
  "editor.design": "डिझाइन",
  "editor.yourNames": "तुमची नावे",
  "editor.name": "नाव",
  "editor.partnersName": "जोडीदाराचे नाव",
  "editor.families": "कुटुंबे",
  "editor.familiesNote":
    "भारतीय आमंत्रणांमध्ये पालकांची नावे दिली जातात; वगळायचे असल्यास रिकामे ठेवा.",
  "editor.firstSide": "पहिली बाजू",
  "editor.secondSide": "दुसरी बाजू",
  "editor.parents": "पालक",
  "editor.grandparents": "आजी-आजोबा",
  "editor.qualifications": "पात्रता",
  "editor.openingText": "सुरुवातीचा मजकूर",
  "editor.openingTextHint":
    "ऐच्छिक — बहुतेक आमंत्रणे मुख्य प्रतिमेपासून थेट नावांकडे जातात, जे सर्वात स्वच्छ दिसते. नावांच्या वर एक ओळ हवी असेल तरच हे भरा.",
  "editor.welcomeLine": "स्वागत ओळ",
  "editor.blessingOrVerse": "आशीर्वाद किंवा श्लोक",
  "editor.attribution": "श्रेय",
  "editor.theDay": "दिवस",
  "editor.occasion": "प्रसंग",
  "editor.dateAndTime": "तारीख आणि वेळ",
  "editor.venue": "ठिकाण",
  "editor.googleMapsLink": "गुगल मॅप्स लिंक",
  "editor.mapsHint":
    "ऐच्छिक — रिकामे ठेवा आणि ठिकाणाच्या नावावर टॅप केल्यास आपोआप गुगल मॅप्सवर शोध होईल. विशिष्ट पिनवर पाहुण्यांना पाठवायचे असेल तरच इथे लिंक टाका.",
  "editor.yourFunctions": "तुमचे कार्यक्रम",
  "editor.addFunction": "कार्यक्रम जोडा",
  "editor.replies": "उत्तरे",
  "editor.whatsappNumber": "व्हॉट्सअ‍ॅप नंबर",
  "editor.replyBy": "या तारखेपर्यंत उत्तर द्या",
  "editor.yourHashtag": "तुमचा हॅशटॅग",
  "editor.travelStay": "प्रवास आणि मुक्काम",
  "editor.gettingThere": "तिथे कसे पोहोचायचे",
  "editor.whereToStay": "कुठे राहायचे",
  "editor.goodToKnow": "जाणून घेणे महत्त्वाचे",
  "editor.music": "संगीत",
  "editor.photos": "फोटो",
  "editor.yourStory": "तुमची कहाणी",
  "editor.lineForGuests": "पाहुण्यांसाठी एक ओळ",
  "editor.togetherSince": "एकत्र कधीपासून",
  "editor.replayOpening": "सुरुवात पुन्हा पहा",
  "editor.previewNote":
    "ही थेट पूर्वावलोकन आहे — डावीकडे केलेला प्रत्येक बदल इथे लगेच दिसतो. एखादे फील्ड रिकामे ठेवल्यास ते तुमच्या आमंत्रणातून वगळले जाते; कधीही रिकामी ओळ किंवा प्लेसहोल्डर मजकूर दिसत नाही. नमुना फोटो या पूर्वावलोकनात फक्त रिकाम्या फोटो जागांमध्ये दिसू शकतात — तुम्ही तुमचे स्वतःचे फोटो जोडेपर्यंत पाहुण्यांना त्या जागा रिकाम्या दिसतात.",
  "collection.eyebrow": "\u0938\u0902\u0917\u094d\u0930\u0939",
  "collection.heading":
    "{count} \u092e\u093e\u0930\u094d\u0917 \u0938\u093e\u0902\u0917\u0923\u094d\u092f\u093e\u091a\u0947",
  "collection.headingEm": "\u0938\u0947\u0935\u094d\u0939 \u0926 \u0921\u0947\u091f",
  "collection.sub":
    "\u092a\u094d\u0930\u0924\u094d\u092f\u0947\u0915 \u0921\u093f\u091d\u093e\u0907\u0928 \u0939\u093e \u092a\u0939\u093f\u0932\u094d\u092f\u093e \u0938\u094d\u092a\u0930\u094d\u0936\u093e\u092a\u093e\u0938\u0942\u0928 \u0905\u0916\u0947\u0930\u091a\u094d\u092f\u093e \u0915\u093e\u0909\u0902\u091f\u0921\u093e\u0909\u0928\u092a\u0930\u094d\u092f\u0902\u0924\u091a\u093e \u0938\u0902\u092a\u0942\u0930\u094d\u0923 \u0905\u0945\u0928\u093f\u092e\u0947\u091f\u0947\u0921 \u0905\u0928\u0941\u092d\u0935 \u0906\u0939\u0947.",
  "collection.seeAll":
    "\u0938\u0930\u094d\u0935 {count} \u0921\u093f\u091d\u093e\u0907\u0928\u094d\u0938 \u092a\u0939\u093e",
  "how.eyebrow":
    "\u0939\u0947 \u0915\u0938\u0947 \u0915\u093e\u092e \u0915\u0930\u0924\u0947",
  "how.heading":
    "\u090f\u0915\u093e \u0938\u0902\u0927\u094d\u092f\u093e\u0915\u093e\u0933\u0940\u0924",
  "how.headingEm": "\u0924\u092f\u093e\u0930",
  "steps.1.title": "\u0921\u093f\u091d\u093e\u0907\u0928 \u0928\u093f\u0935\u0921\u093e",
  "steps.1.body":
    "{count} \u0905\u0945\u0928\u093f\u092e\u0947\u091f\u0947\u0921 \u0928\u093f\u092e\u0902\u0924\u094d\u0930\u0923\u0947 \u092a\u093e\u0939\u093e \u2014 \u0936\u093e\u0939\u0940, \u0906\u0927\u0941\u0928\u093f\u0915, \u092b\u0941\u0932\u093e\u0902\u091a\u0940, \u0921\u0947\u0938\u094d\u091f\u093f\u0928\u0947\u0936\u0928. \u092a\u094d\u0930\u0924\u094d\u092f\u0947\u0915 \u090f\u0915 \u0924\u0941\u092e\u091a\u094d\u092f\u093e \u092a\u093e\u0939\u0941\u0923\u094d\u092f\u093e\u0902\u0928\u093e \u0926\u093f\u0938\u0947\u0932 \u0924\u0938\u0947\u091a \u092a\u0942\u0930\u094d\u0935\u093e\u0935\u0932\u094b\u0915\u0928 \u0915\u0930\u093e.",
  "steps.2.title":
    "\u092e\u094b\u092b\u0924 \u0915\u0938\u094d\u091f\u092e\u093e\u0907\u091d \u0915\u0930\u093e",
  "steps.2.body":
    "\u0924\u0941\u092e\u091a\u0940 \u0928\u093e\u0935\u0947, \u0924\u093e\u0930\u0916\u093e, \u0920\u093f\u0915\u093e\u0923\u0947, \u0939\u0933\u0926\u0940\u092a\u093e\u0938\u0942\u0928 \u0930\u093f\u0938\u0947\u092a\u094d\u0936\u0928\u092a\u0930\u094d\u092f\u0902\u0924 \u092a\u094d\u0930\u0924\u094d\u092f\u0947\u0915 \u0915\u093e\u0930\u094d\u092f\u0915\u094d\u0930\u092e, \u092b\u094b\u091f\u094b \u0906\u0923\u093f \u0938\u0902\u0917\u0940\u0924 \u091c\u094b\u0921\u093e. \u0939\u0935\u0947 \u0924\u093f\u0924\u0915\u094d\u092f\u093e \u0935\u0947\u0933\u093e \u092c\u0926\u0932 \u0915\u0930\u093e.",
  "steps.3.title":
    "\u090f\u0915\u0926\u093e \u092a\u0948\u0938\u0947 \u0926\u094d\u092f\u093e, \u0936\u0947\u0905\u0930 \u0915\u0930\u093e",
  "steps.3.body":
    "\u20b9599 \u092e\u0927\u094d\u092f\u0947 \u092a\u094d\u0930\u0915\u093e\u0936\u093f\u0924 \u0915\u0930\u093e \u0906\u0923\u093f \u0924\u0941\u092e\u091a\u0940 \u0938\u094d\u0935\u0924\u0903\u091a\u0940 \u0932\u093f\u0902\u0915 \u092e\u093f\u0933\u0935\u093e. \u0924\u0940 \u0935\u094d\u0939\u0949\u091f\u094d\u0938\u0905\u200d\u0945\u092a, \u0907\u0928\u094d\u0938\u094d\u091f\u093e\u0917\u094d\u0930\u093e\u092e, \u0915\u0941\u0920\u0947\u0939\u0940 \u092a\u093e\u0920\u0935\u093e \u2014 \u0924\u0940 \u0915\u094b\u0923\u0924\u094d\u092f\u093e\u0939\u0940 \u092b\u094b\u0928\u0935\u0930 \u0938\u0941\u0930\u0947\u0916 \u0909\u0918\u0921\u0924\u0947.",
  "compare.eyebrow":
    "\u0921\u093f\u091c\u093f\u091f\u0932 \u0915\u093e \u0928\u093f\u0935\u0921\u093e\u0935\u0947",
  "compare.heading": "\u0915\u093e\u0917\u0926",
  "compare.headingEm": "\u0935\u093f\u0930\u0941\u0926\u094d\u0927",
  "compare.headingSuffix": "\u0921\u093f\u091c\u093f\u091f\u0932",
  "compare.colFeature": "\u0935\u0948\u0936\u093f\u0937\u094d\u091f\u094d\u092f",
  "compare.colPaper": "\u0915\u093e\u0917\u0926",
  "compare.colDigital": "\u0921\u093f\u091c\u093f\u091f\u0932",
  "compare.row.cost.feature": "\u0915\u093f\u0902\u092e\u0924",
  "compare.row.cost.paper":
    "\u20b9150\u2013\u20b9500+ \u092a\u094d\u0930\u0924\u093f \u0915\u093e\u0930\u094d\u0921, \u0936\u093f\u0935\u093e\u092f \u091b\u092a\u093e\u0908",
  "compare.row.cost.digital": "\u20b9599 \u090f\u0915\u0926\u093e\u091a",
  "compare.row.delivery.feature": "\u0935\u093f\u0924\u0930\u0923 \u0935\u0947\u0933",
  "compare.row.delivery.paper":
    "\u091b\u092a\u093e\u0908 \u0935 \u0915\u0941\u0930\u093f\u0905\u0930\u0938\u093e\u0920\u0940 1\u20132 \u0906\u0920\u0935\u0921\u0947",
  "compare.row.delivery.digital": "\u0924\u094d\u0935\u0930\u093f\u0924",
  "compare.row.animation.feature":
    "\u0913\u092a\u0928\u093f\u0902\u0917 \u0905\u0945\u0928\u093f\u092e\u0947\u0936\u0928",
  "compare.row.music.feature":
    "\u092a\u093e\u0930\u094d\u0936\u094d\u0935\u0938\u0902\u0917\u0940\u0924",
  "compare.row.countdown.feature":
    "\u0932\u093e\u0907\u0935\u094d\u0939 \u0915\u093e\u0909\u0902\u091f\u0921\u093e\u0909\u0928",
  "compare.row.editable.feature":
    "\u092a\u093e\u0920\u0935\u0932\u094d\u092f\u093e\u0928\u0902\u0924\u0930\u0939\u0940 \u0938\u0902\u092a\u093e\u0926\u0928\u092f\u094b\u0917\u094d\u092f",
  "compare.row.maps.feature":
    "\u0917\u0942\u0917\u0932 \u092e\u0945\u092a\u094d\u0938 \u0926\u093f\u0936\u093e",
  "compare.row.guests.feature":
    "\u0905\u092e\u0930\u094d\u092f\u093e\u0926\u093f\u0924 \u092a\u093e\u0939\u0941\u0923\u0947 \u0935 \u0936\u0947\u0905\u0930\u094d\u0938",
  "compare.row.whatsapp.feature":
    "\u0935\u094d\u0939\u0949\u091f\u094d\u0938\u0905\u200d\u0945\u092a\u0935\u0930 \u0936\u0947\u0905\u0930 \u0915\u0930\u0923\u094d\u092f\u093e\u092f\u094b\u0917\u094d\u092f",
  "pricing.eyebrow": "\u0915\u093f\u0902\u092e\u0924",
  "pricing.heading1": "\u090f\u0915 \u0915\u093f\u0902\u092e\u0924.",
  "pricing.heading2":
    "\u0915\u094b\u0923\u0924\u0940\u0939\u0940 \u0938\u0926\u0938\u094d\u092f\u0924\u093e \u0928\u093e\u0939\u0940.",
  "pricing.body":
    "\u0939\u0935\u0947 \u0924\u093f\u0924\u0915\u0947 \u092e\u094b\u092b\u0924 \u0921\u093f\u091d\u093e\u0907\u0928 \u0935 \u092a\u0942\u0930\u094d\u0935\u093e\u0935\u0932\u094b\u0915\u0928 \u0915\u0930\u093e. \u091c\u0917\u093e\u0938\u094b\u092c\u0924 \u0936\u0947\u0905\u0930 \u0915\u0930\u0923\u094d\u092f\u093e\u0938 \u0924\u092f\u093e\u0930 \u0905\u0938\u093e\u0932 \u0924\u0947\u0935\u094d\u0939\u093e\u091a \u092a\u0948\u0938\u0947 \u0926\u094d\u092f\u093e.",
  "pricing.theInvitation": "\u0928\u093f\u092e\u0902\u0924\u094d\u0930\u0923",
  "pricing.oneTime": "\u090f\u0915\u0926\u093e\u091a",
  "pricing.startCustomising":
    "\u092e\u094b\u092b\u0924 \u0915\u0938\u094d\u091f\u092e\u093e\u0907\u091d \u0915\u0930\u0923\u0947 \u0938\u0941\u0930\u0942 \u0915\u0930\u093e",
  "included.0":
    "\u0906\u092e\u091a\u094d\u092f\u093e {count} \u0905\u0945\u0928\u093f\u092e\u0947\u091f\u0947\u0921 \u0921\u093f\u091d\u093e\u0907\u0928\u094d\u0938\u092a\u0948\u0915\u0940 \u0915\u094b\u0923\u0924\u0947\u0939\u0940",
  "included.1":
    "\u0905\u092e\u0930\u094d\u092f\u093e\u0926\u093f\u0924 \u0915\u093e\u0930\u094d\u092f\u0915\u094d\u0930\u092e \u2014 \u0939\u0933\u0926\u0940\u092a\u093e\u0938\u0942\u0928 \u0930\u093f\u0938\u0947\u092a\u094d\u0936\u0928\u092a\u0930\u094d\u092f\u0902\u0924",
  "included.2":
    "\u092b\u094b\u091f\u094b \u0917\u0945\u0932\u0930\u0940, \u0938\u0902\u0917\u0940\u0924 \u0935 \u0932\u093e\u0907\u0935\u094d\u0939 \u0915\u093e\u0909\u0902\u091f\u0921\u093e\u0909\u0928",
  "included.3":
    "\u092a\u094d\u0930\u0924\u094d\u092f\u0947\u0915 \u0920\u093f\u0915\u093e\u0923\u093e\u0938\u093e\u0920\u0940 \u0917\u0942\u0917\u0932 \u092e\u0945\u092a\u094d\u0938 \u0926\u093f\u0936\u093e",
  "included.4":
    "\u0905\u092e\u0930\u094d\u092f\u093e\u0926\u093f\u0924 \u092a\u093e\u0939\u0941\u0923\u0947, \u0905\u092e\u0930\u094d\u092f\u093e\u0926\u093f\u0924 \u0936\u0947\u0905\u0930\u094d\u0938",
  "included.5":
    "\u092a\u094d\u0930\u0915\u093e\u0936\u093f\u0924 \u0915\u0947\u0932\u094d\u092f\u093e\u0928\u0902\u0924\u0930 \u0915\u0927\u0940\u0939\u0940 \u0924\u092a\u0936\u0940\u0932 \u092c\u0926\u0932\u093e",
  "faq.eyebrow": "\u092a\u094d\u0930\u0936\u094d\u0928",
  "faq.heading": "\u0938\u0941\u0930\u0942 \u0915\u0930\u0923\u094d\u092f\u093e",
  "faq.headingEm": "\u0906\u0927\u0940",
  "faq.q0":
    "\u0921\u093f\u091d\u093e\u0907\u0928 \u0915\u0930\u0923\u0947 \u0916\u0930\u0902\u091a \u092e\u094b\u092b\u0924 \u0906\u0939\u0947 \u0915\u093e?",
  "faq.a0":
    "होय. कोणतेही डिझाइन निवडा, तुमची नावे, तारखा व ठिकाणे जोडा आणि संपूर्ण गोष्ट तुमच्या फोनवर पूर्वावलोकन करा — सर्व मोफत. तुमचे स्वतःचे फोटो किंवा संगीत जोडण्यासाठी फक्त एक मोफत खाते लागते. तुम्ही फक्त प्रकाशित करताना पैसे देता.",
  "faq.q1":
    "\u20b9599 \u0928\u0947\u092e\u0915\u0947 \u0915\u0936\u093e\u0938\u093e\u0920\u0940 \u0906\u0939\u0947\u0924?",
  "faq.a1":
    "\u090f\u0915 \u0928\u093f\u092e\u0902\u0924\u094d\u0930\u0923, \u090f\u0915\u0926\u093e\u091a \u092a\u094d\u0930\u0915\u093e\u0936\u093f\u0924, \u0938\u094d\u0935\u0924\u0903\u091a\u094d\u092f\u093e \u0936\u0947\u0905\u0930 \u0915\u0930\u0923\u094d\u092f\u093e\u092f\u094b\u0917\u094d\u092f \u0932\u093f\u0902\u0915\u0938\u0939 \u2014 \u0935\u0949\u091f\u0930\u092e\u093e\u0930\u094d\u0915 \u0928\u093e\u0939\u0940, \u0938\u0926\u0938\u094d\u092f\u0924\u093e \u0928\u093e\u0939\u0940, \u092a\u094d\u0930\u0924\u093f-\u092a\u093e\u0939\u0941\u0923\u0947 \u0936\u0941\u0932\u094d\u0915 \u0928\u093e\u0939\u0940. \u0932\u0917\u094d\u0928\u093e\u092a\u0930\u094d\u092f\u0902\u0924 \u0924\u0941\u092e\u094d\u0939\u0940 \u0924\u0947 \u092a\u094d\u0930\u0915\u093e\u0936\u093f\u0924 \u0915\u0947\u0932\u094d\u092f\u093e\u0928\u0902\u0924\u0930\u0939\u0940 \u0938\u0902\u092a\u093e\u0926\u093f\u0924 \u0915\u0930\u0942 \u0936\u0915\u0924\u093e.",
  "faq.q2":
    "\u092e\u0940 \u092e\u0947\u0939\u0902\u0926\u0940, \u0938\u0902\u0917\u0940\u0924 \u0906\u0923\u093f \u0930\u093f\u0938\u0947\u092a\u094d\u0936\u0928 \u0935\u0947\u0917\u0935\u0947\u0917\u0933\u0947 \u091c\u094b\u0921\u0942 \u0936\u0915\u0924\u094b \u0915\u093e?",
  "faq.a2":
    "\u0939\u094b\u092f \u2014 \u0924\u0941\u092e\u094d\u0939\u093e\u0932\u093e \u0939\u0935\u0947 \u0924\u093f\u0924\u0915\u0947 \u0915\u093e\u0930\u094d\u092f\u0915\u094d\u0930\u092e \u091c\u094b\u0921\u093e, \u092a\u094d\u0930\u0924\u094d\u092f\u0947\u0915\u093e\u091a\u0940 \u0938\u094d\u0935\u0924\u0903\u091a\u0940 \u0924\u093e\u0930\u0940\u0916, \u0935\u0947\u0933, \u0920\u093f\u0915\u093e\u0923 \u0935 \u0921\u094d\u0930\u0947\u0938 \u0915\u094b\u0921, \u0938\u0930\u094d\u0935 \u090f\u0915\u093e\u091a \u0928\u093f\u092e\u0902\u0924\u094d\u0930\u0923 \u0932\u093f\u0902\u0915\u092e\u0927\u094d\u092f\u0947.",
  "faq.q3":
    "\u0935\u094d\u0939\u0949\u091f\u094d\u0938\u0905\u200d\u0945\u092a\u0935\u0930 \u0928\u0938\u0932\u0947\u0932\u094d\u092f\u093e \u092a\u093e\u0939\u0941\u0923\u094d\u092f\u093e\u0902\u0938\u093e\u0920\u0940 \u0939\u0947 \u0915\u093e\u092e \u0915\u0930\u0947\u0932 \u0915\u093e?",
  "faq.a3":
    "\u0932\u093f\u0902\u0915 \u0939\u0940 \u090f\u0915 \u0938\u093e\u092e\u093e\u0928\u094d\u092f \u0935\u0947\u092c \u092a\u0947\u091c \u0906\u0939\u0947, \u0924\u094d\u092f\u093e\u092e\u0941\u0933\u0947 \u0924\u0940 \u090f\u0938\u090f\u092e\u090f\u0938, \u0907\u0928\u094d\u0938\u094d\u091f\u093e\u0917\u094d\u0930\u093e\u092e, \u0908\u092e\u0947\u0932 \u0915\u093f\u0902\u0935\u093e \u0907\u0924\u0930 \u0915\u094b\u0923\u0924\u094d\u092f\u093e\u0939\u0940 \u0905\u200d\u0945\u092a\u0935\u0930 \u0924\u0936\u0940\u091a \u0909\u0918\u0921\u0924\u0947 \u2014 \u0935\u094d\u0939\u0949\u091f\u094d\u0938\u0905\u200d\u0945\u092a \u092b\u0915\u094d\u0924 \u092a\u093e\u0920\u0935\u0923\u094d\u092f\u093e\u091a\u093e \u0938\u094b\u092a\u093e \u092e\u093e\u0930\u094d\u0917 \u0906\u0939\u0947.",
  "faq.q4":
    "\u0932\u093f\u0902\u0915 \u0936\u0947\u0905\u0930 \u0915\u0947\u0932\u094d\u092f\u093e\u0928\u0902\u0924\u0930 \u092e\u0940 \u0924\u092a\u0936\u0940\u0932 \u092c\u0926\u0932\u0942 \u0936\u0915\u0924\u094b \u0915\u093e?",
  "faq.a4":
    "\u0939\u094b\u092f. \u0924\u0941\u092e\u091a\u094d\u092f\u093e \u0915\u093e\u0930\u094d\u092f\u0915\u094d\u0930\u092e\u093e\u092a\u0942\u0930\u094d\u0935\u0940 \u0915\u0927\u0940\u0939\u0940 \u0928\u093e\u0935\u0947, \u0924\u093e\u0930\u0916\u093e, \u0920\u093f\u0915\u093e\u0923\u0947 \u0915\u093f\u0902\u0935\u093e \u092b\u094b\u091f\u094b \u092c\u0926\u0932\u093e \u2014 \u0932\u093f\u0902\u0915 \u0924\u0940\u091a \u0930\u093e\u0939\u0924\u0947, \u0924\u094d\u092f\u093e\u092e\u0941\u0933\u0947 \u092a\u093e\u0939\u0941\u0923\u094d\u092f\u093e\u0902\u0928\u093e \u0928\u0947\u0939\u092e\u0940 \u0928\u0935\u0940\u0928\u0924\u092e \u0906\u0935\u0943\u0924\u094d\u0924\u0940 \u0926\u093f\u0938\u0924\u0947.",
  "faq.q5": "\u20b9599 \u0915\u093e?",
  "faq.a5":
    "\u0939\u0947 \u0924\u0941\u092e\u091a\u0947 \u0928\u093f\u092e\u0902\u0924\u094d\u0930\u0923 \u0939\u094b\u0938\u094d\u091f \u0915\u0930\u0923\u0947 \u0906\u0923\u093f \u092a\u0947\u092e\u0947\u0902\u091f \u092a\u094d\u0930\u0915\u094d\u0930\u093f\u092f\u093e \u091a\u093e\u0932\u0935\u0923\u0947 \u092f\u093e\u0902\u091a\u093e \u0916\u0930\u094d\u091a \u092d\u093e\u0917\u0935\u0924\u0947 \u2014 \u0938\u0930\u094d\u0935\u094d\u0939\u0930 \u0935 \u092a\u0947\u092e\u0947\u0902\u091f \u0917\u0947\u091f\u0935\u0947 \u0926\u094b\u0918\u0947\u0939\u0940 \u092a\u094d\u0930\u0924\u093f \u0928\u093f\u092e\u0902\u0924\u094d\u0930\u0923 \u0936\u0941\u0932\u094d\u0915 \u0906\u0915\u093e\u0930\u0924\u093e\u0924. \u0906\u092e\u094d\u0939\u0940 \u0924\u094d\u092f\u093e\u0935\u0930 \u091c\u093e\u0938\u094d\u0924 \u0928\u092b\u093e \u092e\u093f\u0933\u0935\u0923\u094d\u092f\u093e\u091a\u093e \u092a\u094d\u0930\u092f\u0924\u094d\u0928 \u0915\u0930\u0924 \u0928\u093e\u0939\u0940; \u090f\u0915\u093e \u092e\u0939\u093f\u0928\u094d\u092f\u093e\u0924 \u0928\u093e\u0939\u0940\u0936\u093e \u0939\u094b\u0923\u093e\u0931\u094d\u092f\u093e \u092e\u094b\u092b\u0924 \u0928\u093f\u092e\u0902\u0924\u094d\u0930\u0923\u093e\u092a\u0947\u0915\u094d\u0937\u093e \u0924\u0941\u092e\u094d\u0939\u093e\u0932\u093e \u090f\u0915 \u0938\u0941\u0902\u0926\u0930 \u0928\u093f\u092e\u0902\u0924\u094d\u0930\u0923 \u092e\u093f\u0933\u093e\u0935\u0947 \u0905\u0938\u0947 \u0906\u092e\u094d\u0939\u093e\u0932\u093e \u0935\u093e\u091f\u0924\u0947.",
  "faq.q6":
    "\u092e\u0940 \u092e\u093e\u091d\u0947 \u0938\u094d\u0935\u0924\u0903\u091a\u0947 \u092b\u094b\u091f\u094b \u0906\u0923\u093f \u0938\u0902\u0917\u0940\u0924 \u0935\u093e\u092a\u0930\u0942 \u0936\u0915\u0924\u094b \u0915\u093e?",
  "faq.a6":
    "\u0939\u094b\u092f. \u0917\u0945\u0932\u0930\u0940\u0938\u093e\u0920\u0940 \u0924\u0941\u092e\u091a\u0947 \u0938\u094d\u0935\u0924\u0903\u091a\u0947 \u092b\u094b\u091f\u094b \u0905\u092a\u0932\u094b\u0921 \u0915\u0930\u093e \u0906\u0923\u093f \u0906\u092e\u091a\u094d\u092f\u093e \u0932\u093e\u092f\u092c\u094d\u0930\u0930\u0940\u0924\u0942\u0928 \u091f\u094d\u0930\u0945\u0915 \u0928\u093f\u0935\u0921\u093e \u0915\u093f\u0902\u0935\u093e \u0924\u0941\u092e\u091a\u0947 \u0938\u094d\u0935\u0924\u0903\u091a\u0947 \u0917\u093e\u0923\u0947 \u0905\u092a\u0932\u094b\u0921 \u0915\u0930\u093e \u2014 \u0905\u092a\u0932\u094b\u0921 \u0924\u0941\u092e\u091a\u094d\u092f\u093e \u0916\u093e\u0924\u094d\u092f\u093e\u0924 \u091c\u0924\u0928 \u0915\u0947\u0932\u0947 \u091c\u093e\u0924\u093e\u0924, \u0924\u094d\u092f\u093e\u092e\u0941\u0933\u0947 \u0924\u0941\u092e\u094d\u0939\u0940 \u092a\u094d\u0930\u0915\u093e\u0936\u093f\u0924 \u0915\u0930\u0924\u093e \u0924\u0947\u0935\u094d\u0939\u093e \u0924\u0947 \u0924\u093f\u0925\u0947 \u0905\u0938\u0924\u093e\u0924. \u090f\u0915 \u0921\u093f\u091d\u093e\u0907\u0928, \u0926\u0941\u092c\u0908 \u0938\u093f\u0932\u094d\u0915, \u0938\u094d\u0935\u0924\u0903\u091a\u094d\u092f\u093e \u0925\u0940\u092e \u091f\u094d\u0930\u0945\u0915\u0938\u0939 \u092f\u0947\u0924\u0947; \u0907\u0924\u0930 \u0921\u093f\u091d\u093e\u0907\u0928\u094d\u0938 \u0924\u0941\u092e\u094d\u0939\u0940 \u0938\u0902\u0917\u0940\u0924 \u0928\u093f\u0935\u0921\u0947\u092a\u0930\u094d\u092f\u0902\u0924 \u0936\u093e\u0902\u0924 \u0930\u093e\u0939\u0924\u093e\u0924.",
  "faq.q7":
    "\u092a\u093e\u0939\u0941\u0923\u094d\u092f\u093e\u0902\u091a\u0940 \u0938\u0902\u0916\u094d\u092f\u093e \u0915\u093f\u0902\u0935\u093e \u0932\u093f\u0902\u0915 \u0915\u093f\u0924\u0940 \u0935\u0947\u0933\u093e \u0909\u0918\u0921\u0932\u0940 \u092f\u093e\u0935\u0930 \u092e\u0930\u094d\u092f\u093e\u0926\u093e \u0906\u0939\u0947 \u0915\u093e?",
  "faq.a7":
    "\u0928\u093e\u0939\u0940. \u0924\u0941\u092e\u094d\u0939\u093e\u0932\u093e \u0939\u0935\u0947 \u0924\u093f\u0924\u0915\u094d\u092f\u093e \u092a\u093e\u0939\u0941\u0923\u094d\u092f\u093e\u0902\u0938\u094b\u092c\u0924, \u0915\u093f\u0924\u0940\u0939\u0940 \u0917\u091f\u093e\u0902\u092e\u0927\u094d\u092f\u0947 \u0932\u093f\u0902\u0915 \u0936\u0947\u0905\u0930 \u0915\u0930\u093e \u2014 \u092a\u093e\u0939\u0941\u0923\u094d\u092f\u093e\u0902\u091a\u0940 \u092e\u0930\u094d\u092f\u093e\u0926\u093e \u0928\u093e\u0939\u0940 \u0906\u0923\u093f \u092a\u093e\u0939\u0923\u094d\u092f\u093e\u091a\u0940 \u092e\u0930\u094d\u092f\u093e\u0926\u093e \u0928\u093e\u0939\u0940.",
  "faq.q8":
    "\u092a\u093e\u0939\u0941\u0923\u094d\u092f\u093e\u0902\u0928\u093e \u0915\u093e\u0939\u0940 \u0907\u0928\u094d\u0938\u094d\u091f\u0949\u0932 \u0915\u0930\u093e\u0935\u0947 \u0932\u093e\u0917\u0947\u0932 \u0915\u093f\u0902\u0935\u093e \u0938\u093e\u0907\u0928 \u0905\u092a \u0915\u0930\u093e\u0935\u0947 \u0932\u093e\u0917\u0947\u0932 \u0915\u093e?",
  "faq.a8":
    "\u0928\u093e\u0939\u0940. \u0932\u093f\u0902\u0915 \u0924\u094d\u092f\u093e\u0902\u091a\u094d\u092f\u093e \u092b\u094b\u0928\u091a\u094d\u092f\u093e \u092c\u094d\u0930\u093e\u0909\u091d\u0930\u092e\u0927\u094d\u092f\u0947 \u0925\u0947\u091f \u0909\u0918\u0921\u0924\u0947 \u2014 \u0905\u200d\u0945\u092a \u0928\u093e\u0939\u0940, \u0916\u093e\u0924\u0947 \u0928\u093e\u0939\u0940, \u0907\u0928\u094d\u0938\u094d\u091f\u0949\u0932 \u0915\u0930\u0923\u094d\u092f\u093e\u0938\u093e\u0930\u0916\u0947 \u0915\u093e\u0939\u0940\u0939\u0940 \u0928\u093e\u0939\u0940.",
  "faq.q9":
    "\u092a\u094d\u0930\u0915\u093e\u0936\u093f\u0924 \u0915\u0947\u0932\u094d\u092f\u093e\u0928\u0902\u0924\u0930 \u092e\u0932\u093e \u0924\u0947 \u0906\u0935\u0921\u0932\u0947 \u0928\u093e\u0939\u0940 \u0924\u0930?",
  "faq.a9":
    "\u0924\u0941\u092e\u094d\u0939\u0940 \u0915\u094b\u0923\u0924\u094d\u092f\u093e\u0939\u0940 \u0905\u0924\u093f\u0930\u093f\u0915\u094d\u0924 \u0916\u0930\u094d\u091a\u093e\u0936\u093f\u0935\u093e\u092f \u092a\u094d\u0930\u0915\u093e\u0936\u093f\u0924 \u0928\u093f\u092e\u0902\u0924\u094d\u0930\u0923 \u0938\u0902\u092a\u093e\u0926\u093f\u0924 \u0915\u0930\u0924 \u0930\u093e\u0939\u0942 \u0936\u0915\u0924\u093e. \u0915\u093e\u0939\u0940 \u0916\u0930\u094b\u0916\u0930 \u092c\u093f\u0918\u0921\u0932\u0947 \u0905\u0938\u0932\u094d\u092f\u093e\u0938, \u0906\u092e\u091a\u0947 \u092a\u0930\u0924\u093e\u0935\u093e \u0927\u094b\u0930\u0923 \u092a\u093e\u0939\u093e \u2014 \u0906\u092e\u094d\u0939\u0940 \u0924\u0947 \u0926\u0941\u0930\u0941\u0938\u094d\u0924 \u0915\u0930\u0942 \u0915\u093f\u0902\u0935\u093e \u092a\u0930\u0924\u093e\u0935\u093e \u0926\u0947\u090a.",
  "faq.q10":
    "\u092e\u0940 \u0905\u0921\u0915\u0932\u094b \u0924\u0930 \u092e\u0926\u0924 \u092e\u093f\u0933\u0942 \u0936\u0915\u0924\u0947 \u0915\u093e?",
  "faq.a10":
    "\u0939\u094b\u092f \u2014 \u0906\u092e\u091a\u094d\u092f\u093e \u0938\u0902\u092a\u0930\u094d\u0915 \u092a\u093e\u0928\u093e\u0935\u0930\u0942\u0928 \u0915\u0927\u0940\u0939\u0940 \u0906\u092e\u091a\u094d\u092f\u093e\u0936\u0940 \u0938\u0902\u092a\u0930\u094d\u0915 \u0938\u093e\u0927\u093e \u0906\u0923\u093f \u0906\u092e\u094d\u0939\u0940 \u0924\u0941\u092e\u091a\u0947 \u0928\u093f\u092e\u0902\u0924\u094d\u0930\u0923 \u0924\u092f\u093e\u0930 \u0915\u0930\u0923\u094d\u092f\u093e\u0938 \u092e\u0926\u0924 \u0915\u0930\u0942.",
  "closing.shubhVivah": "\u0936\u0941\u092d \u0935\u093f\u0935\u093e\u0939",
  "closing.heading": "\u090f\u0915\u093e",
  "closing.headingEm": "\u0938\u0941\u0902\u0926\u0930",
  "closing.headingSuffix":
    "\u0938\u0932\u093e\u092e\u094d\u092f\u093e\u0928\u0947 \u0938\u0941\u0930\u0941\u0935\u093e\u0924 \u0915\u0930\u093e.",
  "closing.createYours":
    "\u0924\u0941\u092e\u091a\u0947 \u0924\u092f\u093e\u0930 \u0915\u0930\u093e",
};

const gu: Partial<Dictionary> = {
  "nav.designs": "ડિઝાઇન",
  "nav.howItWorks": "તે કેવી રીતે કાર્ય કરે છે",
  "nav.pricing": "કિંમત",
  "nav.faq": "વારંવાર પૂછાતા પ્રશ્નો",
  "nav.createYours": "તમારું બનાવો",
  "nav.signIn": "સાઇન ઇન કરો",
  "nav.dashboard": "ડેશબોર્ડ",
  "nav.signOut": "સાઇન આઉટ કરો",
  "nav.openMenu": "મેનુ ખોલો",
  "nav.closeMenu": "મેનુ બંધ કરો",
  "nav.primaryLabel": "મુખ્ય",
  "footer.tagline":
    "દરેક મહેમાનના ફોન માટે એનિમેટેડ લગ્ન આમંત્રણો. કોઈ ભૌતિક ઉત્પાદનો મોકલવામાં આવતા નથી.",
  "footer.explore": "શોધો",
  "footer.policies": "નીતિઓ",
  "footer.terms": "શરતો",
  "footer.privacy": "ગોપનીયતા",
  "footer.refunds": "રિફંડ",
  "footer.contact": "સંપર્ક કરો",
  "footer.copy": "પ્રેમથી બનાવેલ, પ્રેમ માટે.",
  "hero.eyebrow": "ડિજિટલ લગ્ન આમંત્રણો",
  "hero.titleLine1": "એક આમંત્રણ",
  "hero.titleOpenPrefix": "જે તેઓ ",
  "hero.titleOpen": "બે વાર ખોલશે",
  "hero.titleLine3": "",
  "hero.lede":
    "પરબિડીયાઓ જે ખુલે છે, મહેલના દરવાજા જે અલગ થાય છે, ગોલ્ડ ફોઇલ હેઠળ જાહેર થતી તારીખ. તમારા ખાસ દિવસ માટે તમારું પોતાનું વ્યક્તિગત વેબપેજ — એક વોટ્સએપ લિંકમાં શેર કરો.",
  "hero.browseDesigns": "{count} ડિઝાઇન જુઓ",
  "hero.noteStrong": "અમર્યાદિત કસ્ટમાઇઝેશન",
  "hero.noteRest": "હંમેશા મફત",
  "theme.preview": "પૂર્વાવલોકન",
  "theme.useDesign": "આ ડિઝાઇન વાપરો",
  "editor.design": "ડિઝાઇન",
  "editor.yourNames": "તમારા નામો",
  "editor.name": "નામ",
  "editor.partnersName": "પાર્ટનરનું નામ",
  "editor.families": "પરિવારો",
  "editor.familiesNote":
    "ભારતીય આમંત્રણોમાં માતા-પિતાના નામ આપવામાં આવે છે; છોડવું હોય તો ખાલી રાખો.",
  "editor.firstSide": "પ્રથમ પક્ષ",
  "editor.secondSide": "બીજો પક્ષ",
  "editor.parents": "માતા-પિતા",
  "editor.grandparents": "દાદા-દાદી",
  "editor.qualifications": "લાયકાત",
  "editor.openingText": "શરૂઆતનું લખાણ",
  "editor.openingTextHint":
    "વૈકલ્પિક — મોટાભાગના આમંત્રણો મુખ્ય છબીથી સીધા નામો પર જાય છે, જે સૌથી સ્વચ્છ દેખાય છે. નામોની ઉપર એક લીટી જોઈતી હોય તો જ આ ભરો.",
  "editor.welcomeLine": "સ્વાગત લીટી",
  "editor.blessingOrVerse": "આશીર્વાદ અથવા શ્લોક",
  "editor.attribution": "શ્રેય",
  "editor.theDay": "દિવસ",
  "editor.occasion": "પ્રસંગ",
  "editor.dateAndTime": "તારીખ અને સમય",
  "editor.venue": "સ્થળ",
  "editor.googleMapsLink": "ગૂગલ મેપ્સ લિંક",
  "editor.mapsHint":
    "વૈકલ્પિક — ખાલી રાખો અને સ્થળના નામ પર ટેપ કરવાથી આપમેળે ગૂગલ મેપ્સ પર શોધ થશે. મહેમાનોને ચોક્કસ પિન પર મોકલવા હોય તો જ અહીં લિંક પેસ્ટ કરો.",
  "editor.yourFunctions": "તમારા કાર્યક્રમો",
  "editor.addFunction": "કાર્યક્રમ ઉમેરો",
  "editor.replies": "જવાબો",
  "editor.whatsappNumber": "વોટ્સએપ નંબર",
  "editor.replyBy": "આ તારીખ સુધીમાં જવાબ આપો",
  "editor.yourHashtag": "તમારો હેશટેગ",
  "editor.travelStay": "મુસાફરી અને રોકાણ",
  "editor.gettingThere": "ત્યાં કેવી રીતે પહોંચવું",
  "editor.whereToStay": "ક્યાં રોકાવું",
  "editor.goodToKnow": "જાણવા જેવું",
  "editor.music": "સંગીત",
  "editor.photos": "ફોટા",
  "editor.yourStory": "તમારી વાર્તા",
  "editor.lineForGuests": "મહેમાનો માટે એક લીટી",
  "editor.togetherSince": "ક્યારથી સાથે છો",
  "editor.replayOpening": "શરૂઆત ફરીથી જુઓ",
  "editor.previewNote":
    "આ લાઇવ પૂર્વાવલોકન છે — ડાબી બાજુનો દરેક ફેરફાર અહીં તરત દેખાય છે. કોઈ ફીલ્ડ ખાલી રાખો તો તે તમારા આમંત્રણમાંથી બાકાત રહે છે; ક્યારેય ખાલી લીટી કે પ્લેસહોલ્ડર ટેક્સ્ટ દેખાતું નથી. નમૂના ફોટા આ પૂર્વાવલોકનમાં માત્ર ખાલી ફોટો સ્થાનોમાં દેખાઈ શકે છે — તમે તમારા પોતાના ફોટા ઉમેરો ત્યાં સુધી મહેમાનોને તે સ્થાનો ખાલી દેખાય છે.",
  "collection.eyebrow": "\u0ab8\u0a82\u0a97\u0acd\u0ab0\u0ab9",
  "collection.heading":
    "{count} \u0ab0\u0ac0\u0aa4\u0acb \u0a95\u0ab9\u0ac7\u0ab5\u0abe\u0aa8\u0ac0",
  "collection.headingEm": "\u0ab8\u0ac7\u0ab5 \u0aa7 \u0aa1\u0ac7\u0a9f",
  "collection.sub":
    "\u0aa6\u0ab0\u0ac7\u0a95 \u0aa1\u0abf\u0a9d\u0abe\u0a87\u0aa8 \u0a8f \u0aaa\u0ab9\u0ac7\u0ab2\u0abe \u0a9f\u0ac5\u0aaa\u0aa5\u0ac0 \u0a85\u0a82\u0aa4\u0abf\u0aae \u0a95\u0abe\u0a89\u0aa8\u0acd\u0a9f\u0aa1\u0abe\u0a89\u0aa8 \u0ab8\u0ac1\u0aa7\u0ac0\u0aa8\u0acb \u0ab8\u0a82\u0aaa\u0ac2\u0ab0\u0acd\u0aa3 \u0a8f\u0aa8\u0abf\u0aae\u0ac7\u0a9f\u0ac7\u0aa1 \u0a85\u0aa8\u0ac1\u0aad\u0ab5 \u0a9b\u0ac7.",
  "collection.seeAll":
    "\u0aac\u0aa7\u0ac0 {count} \u0aa1\u0abf\u0a9d\u0abe\u0a87\u0aa8 \u0a9c\u0ac1\u0a93",
  "how.eyebrow":
    "\u0aa4\u0ac7 \u0a95\u0ac7\u0ab5\u0ac0 \u0ab0\u0ac0\u0aa4\u0ac7 \u0a95\u0abe\u0aae \u0a95\u0ab0\u0ac7 \u0a9b\u0ac7",
  "how.heading": "\u0a8f\u0a95 \u0ab8\u0abe\u0a82\u0a9c\u0aae\u0abe\u0a82",
  "how.headingEm": "\u0aa4\u0ac8\u0aaf\u0abe\u0ab0",
  "steps.1.title":
    "\u0aa1\u0abf\u0a9d\u0abe\u0a87\u0aa8 \u0aaa\u0ab8\u0a82\u0aa6 \u0a95\u0ab0\u0acb",
  "steps.1.body":
    "{count} \u0a8f\u0aa8\u0abf\u0aae\u0ac7\u0a9f\u0ac7\u0aa1 \u0a86\u0aae\u0a82\u0aa4\u0acd\u0ab0\u0aa3\u0acb \u0aac\u0acd\u0ab0\u0abe\u0a89\u0a9d \u0a95\u0ab0\u0acb \u2014 \u0ab0\u0abe\u0a9c\u0ab5\u0ac0, \u0a86\u0aa7\u0ac1\u0aa8\u0abf\u0a95, \u0aab\u0ac2\u0ab2\u0acb\u0ab5\u0abe\u0ab3\u0ac0, \u0aa1\u0ac7\u0ab8\u0acd\u0a9f\u0abf\u0aa8\u0ac7\u0ab6\u0aa8. \u0aa6\u0ab0\u0ac7\u0a95\u0aa8\u0ac7 \u0aac\u0ab0\u0abe\u0aac\u0ab0 \u0a8f \u0ab0\u0ac0\u0aa4\u0ac7 \u0a9c\u0ac1\u0a93 \u0a9c\u0ac7\u0aae \u0aa4\u0aae\u0abe\u0ab0\u0abe \u0aae\u0ab9\u0ac7\u0aae\u0abe\u0aa8\u0acb \u0a9c\u0acb\u0ab6\u0ac7.",
  "steps.2.title":
    "\u0aae\u0aab\u0aa4\u0aae\u0abe\u0a82 \u0a95\u0ab8\u0acd\u0a9f\u0aae\u0abe\u0a87\u0a9d \u0a95\u0ab0\u0acb",
  "steps.2.body":
    "\u0aa4\u0aae\u0abe\u0ab0\u0abe \u0aa8\u0abe\u0aae, \u0aa4\u0abe\u0ab0\u0ac0\u0a96\u0acb, \u0ab8\u0acd\u0aa5\u0ab3\u0acb, \u0ab9\u0ab3\u0aa6\u0ac0\u0aa5\u0ac0 \u0ab0\u0abf\u0ab8\u0ac7\u0aaa\u0acd\u0ab6\u0aa8 \u0ab8\u0ac1\u0aa7\u0ac0\u0aa8\u0acb \u0aa6\u0ab0\u0ac7\u0a95 \u0aaa\u0acd\u0ab0\u0ab8\u0a82\u0a97, \u0aa4\u0aae\u0abe\u0ab0\u0abe \u0aab\u0acb\u0a9f\u0abe \u0a85\u0aa8\u0ac7 \u0ab8\u0a82\u0a97\u0ac0\u0aa4 \u0a89\u0aae\u0ac7\u0ab0\u0acb. \u0aa4\u0aae\u0aa8\u0ac7 \u0a97\u0aae\u0ac7 \u0aa4\u0ac7\u0a9f\u0ab2\u0ac0 \u0ab5\u0abe\u0ab0 \u0aac\u0aa6\u0ab2\u0acb.",
  "steps.3.title":
    "\u0a8f\u0a95 \u0ab5\u0abe\u0ab0 \u0a9a\u0ac2\u0a95\u0ab5\u0acb, \u0ab6\u0ac7\u0ab0 \u0a95\u0ab0\u0acb",
  "steps.3.body":
    "\u20b9599\u0aae\u0abe\u0a82 \u0aaa\u0acd\u0ab0\u0a95\u0abe\u0ab6\u0abf\u0aa4 \u0a95\u0ab0\u0acb \u0a85\u0aa8\u0ac7 \u0aa4\u0aae\u0abe\u0ab0\u0ac0 \u0aaa\u0acb\u0aa4\u0abe\u0aa8\u0ac0 \u0ab2\u0abf\u0a82\u0a95 \u0aae\u0ac7\u0ab3\u0ab5\u0acb. \u0aa4\u0ac7\u0aa8\u0ac7 \u0ab5\u0acb\u0a9f\u0acd\u0ab8\u0a8f\u0aaa, \u0a87\u0aa8\u0acd\u0ab8\u0acd\u0a9f\u0abe\u0a97\u0acd\u0ab0\u0abe\u0aae, \u0a97\u0aae\u0ac7 \u0aa4\u0acd\u0aaf\u0abe\u0a82 \u0aae\u0acb\u0a95\u0ab2\u0acb \u2014 \u0aa4\u0ac7 \u0a95\u0acb\u0a88\u0aaa\u0aa3 \u0aab\u0acb\u0aa8 \u0aaa\u0ab0 \u0ab8\u0ac1\u0a82\u0aa6\u0ab0 \u0ab0\u0ac0\u0aa4\u0ac7 \u0a96\u0ac2\u0ab2\u0ac7 \u0a9b\u0ac7.",
  "compare.eyebrow":
    "\u0aa1\u0abf\u0a9c\u0abf\u0a9f\u0ab2 \u0a95\u0ac7\u0aae \u0aaa\u0ab8\u0a82\u0aa6 \u0a95\u0ab0\u0ab5\u0ac1\u0a82",
  "compare.heading": "\u0a95\u0abe\u0a97\u0ab3",
  "compare.headingEm": "\u0ab5\u0abf\u0ab0\u0ac1\u0aa6\u0acd\u0aa7",
  "compare.headingSuffix": "\u0aa1\u0abf\u0a9c\u0abf\u0a9f\u0ab2",
  "compare.colFeature": "\u0ab5\u0abf\u0ab6\u0ac7\u0ab7\u0aa4\u0abe",
  "compare.colPaper": "\u0a95\u0abe\u0a97\u0ab3",
  "compare.colDigital": "\u0aa1\u0abf\u0a9c\u0abf\u0a9f\u0ab2",
  "compare.row.cost.feature": "\u0a96\u0ab0\u0acd\u0a9a",
  "compare.row.cost.paper":
    "\u20b9150\u2013\u20b9500+ \u0aaa\u0acd\u0ab0\u0aa4\u0abf \u0a95\u0abe\u0ab0\u0acd\u0aa1, \u0a89\u0aaa\u0ab0\u0abe\u0a82\u0aa4 \u0aaa\u0acd\u0ab0\u0abf\u0aa8\u0acd\u0a9f\u0abf\u0a82\u0a97",
  "compare.row.cost.digital": "\u20b9599 \u0a8f\u0a95 \u0ab5\u0a96\u0aa4",
  "compare.row.delivery.feature":
    "\u0aa1\u0abf\u0ab2\u0abf\u0ab5\u0ab0\u0ac0\u0aa8\u0acb \u0ab8\u0aae\u0aaf",
  "compare.row.delivery.paper":
    "\u0aaa\u0acd\u0ab0\u0abf\u0aa8\u0acd\u0a9f\u0abf\u0a82\u0a97 \u0a85\u0aa8\u0ac7 \u0a95\u0ac1\u0ab0\u0abf\u0aaf\u0ab0 \u0aae\u0abe\u0a9f\u0ac7 1\u20132 \u0a85\u0aa0\u0ab5\u0abe\u0aa1\u0abf\u0aaf\u0abe",
  "compare.row.delivery.digital": "\u0aa4\u0ab0\u0aa4 \u0a9c",
  "compare.row.animation.feature":
    "\u0a93\u0aaa\u0aa8\u0abf\u0a82\u0a97 \u0a8f\u0aa8\u0abf\u0aae\u0ac7\u0ab6\u0aa8",
  "compare.row.music.feature":
    "\u0aac\u0ac7\u0a95\u0a97\u0acd\u0ab0\u0abe\u0a89\u0aa8\u0acd\u0aa1 \u0ab8\u0a82\u0a97\u0ac0\u0aa4",
  "compare.row.countdown.feature":
    "\u0ab2\u0abe\u0a87\u0ab5 \u0a95\u0abe\u0a89\u0aa8\u0acd\u0a9f\u0aa1\u0abe\u0a89\u0aa8",
  "compare.row.editable.feature":
    "\u0aae\u0acb\u0a95\u0ab2\u0acd\u0aaf\u0abe \u0aaa\u0a9b\u0ac0 \u0aaa\u0aa3 \u0ab8\u0a82\u0aaa\u0abe\u0aa6\u0aa8\u0aaf\u0acb\u0a97\u0acd\u0aaf",
  "compare.row.maps.feature":
    "\u0a97\u0ac2\u0a97\u0ab2 \u0aae\u0ac7\u0aaa\u0acd\u0ab8 \u0aa6\u0abf\u0ab6\u0abe-\u0aa8\u0abf\u0ab0\u0acd\u0aa6\u0ac7\u0ab6\u0acb",
  "compare.row.guests.feature":
    "\u0a85\u0aae\u0ab0\u0acd\u0aaf\u0abe\u0aa6\u0abf\u0aa4 \u0aae\u0ab9\u0ac7\u0aae\u0abe\u0aa8\u0acb \u0a85\u0aa8\u0ac7 \u0ab6\u0ac7\u0ab0",
  "compare.row.whatsapp.feature":
    "\u0ab5\u0acb\u0a9f\u0acd\u0ab8\u0a8f\u0aaa \u0aaa\u0ab0 \u0ab6\u0ac7\u0ab0 \u0a95\u0ab0\u0ac0 \u0ab6\u0a95\u0abe\u0aaf \u0aa4\u0ac7\u0ab5\u0ac1\u0a82",
  "pricing.eyebrow": "\u0a95\u0abf\u0a82\u0aae\u0aa4",
  "pricing.heading1": "\u0a8f\u0a95 \u0a95\u0abf\u0a82\u0aae\u0aa4.",
  "pricing.heading2":
    "\u0a95\u0acb\u0a88 \u0ab8\u0aac\u0acd\u0ab8\u0acd\u0a95\u0acd\u0ab0\u0abf\u0aaa\u0acd\u0ab6\u0aa8 \u0aa8\u0aa5\u0ac0.",
  "pricing.body":
    "\u0a95\u0acb\u0a88 \u0a96\u0ab0\u0acd\u0a9a \u0ab5\u0abf\u0aa8\u0abe \u0a9c\u0ac7\u0a9f\u0ab2\u0acb \u0ab8\u0aae\u0aaf \u0a87\u0a9a\u0acd\u0a9b\u0acb \u0aa4\u0ac7\u0a9f\u0ab2\u0acb \u0aa1\u0abf\u0a9d\u0abe\u0a87\u0aa8 \u0a85\u0aa8\u0ac7 \u0aaa\u0ac2\u0ab0\u0acd\u0ab5\u0abe\u0ab5\u0ab2\u0acb\u0a95\u0aa8 \u0a95\u0ab0\u0acb. \u0aa6\u0ac1\u0aa8\u0abf\u0aaf\u0abe \u0ab8\u0abe\u0aa5\u0ac7 \u0ab6\u0ac7\u0ab0 \u0a95\u0ab0\u0ab5\u0abe \u0aa4\u0ac8\u0aaf\u0abe\u0ab0 \u0ab9\u0acb \u0aa4\u0acd\u0aaf\u0abe\u0ab0\u0ac7 \u0a9c \u0a9a\u0ac2\u0a95\u0ab5\u0acb.",
  "pricing.theInvitation": "\u0a86\u0aae\u0a82\u0aa4\u0acd\u0ab0\u0aa3",
  "pricing.oneTime": "\u0a8f\u0a95 \u0ab5\u0a96\u0aa4",
  "pricing.startCustomising":
    "\u0aae\u0aab\u0aa4\u0aae\u0abe\u0a82 \u0a95\u0ab8\u0acd\u0a9f\u0aae\u0abe\u0a87\u0a9d \u0a95\u0ab0\u0ab5\u0abe\u0aa8\u0ac1\u0a82 \u0ab6\u0ab0\u0ac2 \u0a95\u0ab0\u0acb",
  "included.0":
    "\u0a85\u0aae\u0abe\u0ab0\u0ac0 {count} \u0a8f\u0aa8\u0abf\u0aae\u0ac7\u0a9f\u0ac7\u0aa1 \u0aa1\u0abf\u0a9d\u0abe\u0a87\u0aa8\u0aae\u0abe\u0a82\u0aa5\u0ac0 \u0a95\u0acb\u0a88\u0aaa\u0aa3",
  "included.1":
    "\u0a85\u0aae\u0ab0\u0acd\u0aaf\u0abe\u0aa6\u0abf\u0aa4 \u0aaa\u0acd\u0ab0\u0ab8\u0a82\u0a97\u0acb \u2014 \u0ab9\u0ab3\u0aa6\u0ac0\u0aa5\u0ac0 \u0ab0\u0abf\u0ab8\u0ac7\u0aaa\u0acd\u0ab6\u0aa8 \u0ab8\u0ac1\u0aa7\u0ac0",
  "included.2":
    "\u0aab\u0acb\u0a9f\u0acb \u0a97\u0ac7\u0ab2\u0ac7\u0ab0\u0ac0, \u0ab8\u0a82\u0a97\u0ac0\u0aa4 \u0a85\u0aa8\u0ac7 \u0ab2\u0abe\u0a87\u0ab5 \u0a95\u0abe\u0a89\u0aa8\u0acd\u0a9f\u0aa1\u0abe\u0a89\u0aa8",
  "included.3":
    "\u0aa6\u0ab0\u0ac7\u0a95 \u0ab8\u0acd\u0aa5\u0ab3 \u0aae\u0abe\u0a9f\u0ac7 \u0a97\u0ac2\u0a97\u0ab2 \u0aae\u0ac7\u0aaa\u0acd\u0ab8 \u0aa6\u0abf\u0ab6\u0abe-\u0aa8\u0abf\u0ab0\u0acd\u0aa6\u0ac7\u0ab6\u0acb",
  "included.4":
    "\u0a85\u0aae\u0ab0\u0acd\u0aaf\u0abe\u0aa6\u0abf\u0aa4 \u0aae\u0ab9\u0ac7\u0aae\u0abe\u0aa8\u0acb, \u0a85\u0aae\u0ab0\u0acd\u0aaf\u0abe\u0aa6\u0abf\u0aa4 \u0ab6\u0ac7\u0ab0",
  "included.5":
    "\u0aaa\u0acd\u0ab0\u0a95\u0abe\u0ab6\u0abf\u0aa4 \u0a95\u0ab0\u0acd\u0aaf\u0abe \u0aaa\u0a9b\u0ac0 \u0a97\u0aae\u0ac7 \u0aa4\u0acd\u0aaf\u0abe\u0ab0\u0ac7 \u0ab5\u0abf\u0a97\u0aa4\u0acb \u0aac\u0aa6\u0ab2\u0acb",
  "faq.eyebrow": "\u0aaa\u0acd\u0ab0\u0ab6\u0acd\u0aa8\u0acb",
  "faq.heading": "\u0ab6\u0ab0\u0ac2 \u0a95\u0ab0\u0aa4\u0abe",
  "faq.headingEm": "\u0aaa\u0ab9\u0ac7\u0ab2\u0abe\u0a82",
  "faq.q0":
    "\u0ab6\u0ac1\u0a82 \u0aa1\u0abf\u0a9d\u0abe\u0a87\u0aa8 \u0a95\u0ab0\u0ab5\u0ac1\u0a82 \u0a96\u0ab0\u0ac7\u0a96\u0ab0 \u0aae\u0aab\u0aa4 \u0a9b\u0ac7?",
  "faq.a0":
    "હા. કોઈપણ ડિઝાઇન પસંદ કરો, તમારા નામ, તારીખો અને સ્થળો ઉમેરો, અને આખી વસ્તુનું તમારા પોતાના ફોન પર પૂર્વાવલોકન કરો — બધું મફત. તમારા પોતાના ફોટા કે સંગીત ઉમેરવા માટે ફક્ત એક મફત ખાતું જોઈએ. તમે ફક્ત પ્રકાશિત કરવાનું પસંદ કરો ત્યારે જ ચૂકવો છો.",
  "faq.q1":
    "\u20b9599 \u0a96\u0ab0\u0ac7\u0a96\u0ab0 \u0ab6\u0ac7\u0aa8\u0abe \u0aae\u0abe\u0a9f\u0ac7 \u0a9a\u0ac2\u0a95\u0ab5\u0abe\u0aaf \u0a9b\u0ac7?",
  "faq.a1":
    "\u0a8f\u0a95 \u0a86\u0aae\u0a82\u0aa4\u0acd\u0ab0\u0aa3, \u0a8f\u0a95 \u0ab5\u0abe\u0ab0 \u0aaa\u0acd\u0ab0\u0a95\u0abe\u0ab6\u0abf\u0aa4, \u0aaa\u0acb\u0aa4\u0abe\u0aa8\u0ac0 \u0ab6\u0ac7\u0ab0 \u0a95\u0ab0\u0ac0 \u0ab6\u0a95\u0abe\u0aaf \u0aa4\u0ac7\u0ab5\u0ac0 \u0ab2\u0abf\u0a82\u0a95 \u0ab8\u0abe\u0aa5\u0ac7 \u2014 \u0a95\u0acb\u0a88 \u0ab5\u0acb\u0a9f\u0ab0\u0aae\u0abe\u0ab0\u0acd\u0a95 \u0aa8\u0ab9\u0ac0\u0a82, \u0a95\u0acb\u0a88 \u0ab8\u0aac\u0acd\u0ab8\u0acd\u0a95\u0acd\u0ab0\u0abf\u0aaa\u0acd\u0ab6\u0aa8 \u0aa8\u0ab9\u0ac0\u0a82, \u0aaa\u0acd\u0ab0\u0aa4\u0abf-\u0aae\u0ab9\u0ac7\u0aae\u0abe\u0aa8 \u0a9a\u0abe\u0ab0\u0acd\u0a9c \u0aa8\u0ab9\u0ac0\u0a82. \u0aa4\u0aae\u0ac7 \u0ab2\u0a97\u0acd\u0aa8 \u0ab8\u0ac1\u0aa7\u0ac0 \u0aaa\u0acd\u0ab0\u0a95\u0abe\u0ab6\u0abf\u0aa4 \u0a95\u0ab0\u0acd\u0aaf\u0abe \u0aaa\u0a9b\u0ac0 \u0aaa\u0aa3 \u0aa4\u0ac7\u0aa8\u0ac7 \u0ab8\u0a82\u0aaa\u0abe\u0aa6\u0abf\u0aa4 \u0a95\u0ab0\u0aa4\u0abe \u0ab0\u0ab9\u0ac0 \u0ab6\u0a95\u0acb \u0a9b\u0acb.",
  "faq.q2":
    "\u0ab6\u0ac1\u0a82 \u0ab9\u0ac1\u0a82 \u0ab9\u0ab3\u0aa6\u0ac0, \u0ab8\u0a82\u0a97\u0ac0\u0aa4 \u0a85\u0aa8\u0ac7 \u0ab0\u0abf\u0ab8\u0ac7\u0aaa\u0acd\u0ab6\u0aa8 \u0a85\u0ab2\u0a97-\u0a85\u0ab2\u0a97 \u0a89\u0aae\u0ac7\u0ab0\u0ac0 \u0ab6\u0a95\u0ac1\u0a82?",
  "faq.a2":
    "\u0ab9\u0abe \u2014 \u0aa4\u0aae\u0aa8\u0ac7 \u0a97\u0aae\u0ac7 \u0aa4\u0ac7\u0a9f\u0ab2\u0abe \u0aaa\u0acd\u0ab0\u0ab8\u0a82\u0a97\u0acb \u0a89\u0aae\u0ac7\u0ab0\u0acb, \u0aa6\u0ab0\u0ac7\u0a95\u0aa8\u0ac0 \u0aaa\u0acb\u0aa4\u0abe\u0aa8\u0ac0 \u0aa4\u0abe\u0ab0\u0ac0\u0a96, \u0ab8\u0aae\u0aaf, \u0ab8\u0acd\u0aa5\u0ab3 \u0a85\u0aa8\u0ac7 \u0aa1\u0acd\u0ab0\u0ac7\u0ab8 \u0a95\u0acb\u0aa1 \u0ab8\u0abe\u0aa5\u0ac7, \u0aac\u0aa7\u0ac1\u0a82 \u0a8f\u0a95 \u0a9c \u0a86\u0aae\u0a82\u0aa4\u0acd\u0ab0\u0aa3 \u0ab2\u0abf\u0a82\u0a95\u0aae\u0abe\u0a82.",
  "faq.q3":
    "\u0ab6\u0ac1\u0a82 \u0aa4\u0ac7 \u0ab5\u0acb\u0a9f\u0acd\u0ab8\u0a8f\u0aaa \u0aaa\u0ab0 \u0aa8 \u0ab9\u0acb\u0aaf \u0aa4\u0ac7\u0ab5\u0abe \u0aae\u0ab9\u0ac7\u0aae\u0abe\u0aa8\u0acb \u0aae\u0abe\u0a9f\u0ac7 \u0a95\u0abe\u0aae \u0a95\u0ab0\u0ab6\u0ac7?",
  "faq.a3":
    "\u0ab2\u0abf\u0a82\u0a95 \u0a8f \u0a8f\u0a95 \u0ab8\u0abe\u0aae\u0abe\u0aa8\u0acd\u0aaf \u0ab5\u0ac7\u0aac \u0aaa\u0ac7\u0a9c \u0a9b\u0ac7, \u0aa4\u0ac7\u0aa5\u0ac0 \u0aa4\u0ac7 \u0a8f\u0ab8\u0a8f\u0aae\u0a8f\u0ab8, \u0a87\u0aa8\u0acd\u0ab8\u0acd\u0a9f\u0abe\u0a97\u0acd\u0ab0\u0abe\u0aae, \u0a87\u0aae\u0ac7\u0a87\u0ab2 \u0a85\u0aa5\u0ab5\u0abe \u0a85\u0aa8\u0acd\u0aaf \u0a95\u0acb\u0a88\u0aaa\u0aa3 \u0a8f\u0aaa \u0aaa\u0ab0 \u0a8f \u0a9c \u0ab0\u0ac0\u0aa4\u0ac7 \u0a96\u0ac2\u0ab2\u0ac7 \u0a9b\u0ac7 \u2014 \u0ab5\u0acb\u0a9f\u0acd\u0ab8\u0a8f\u0aaa \u0a8f \u0aae\u0acb\u0a95\u0ab2\u0ab5\u0abe\u0aa8\u0ac0 \u0aae\u0abe\u0aa4\u0acd\u0ab0 \u0ab8\u0acc\u0aa5\u0ac0 \u0ab8\u0ab0\u0ab3 \u0ab0\u0ac0\u0aa4 \u0a9b\u0ac7.",
  "faq.q4":
    "\u0ab2\u0abf\u0a82\u0a95 \u0ab6\u0ac7\u0ab0 \u0a95\u0ab0\u0acd\u0aaf\u0abe \u0aaa\u0a9b\u0ac0 \u0ab6\u0ac1\u0a82 \u0ab9\u0ac1\u0a82 \u0ab5\u0abf\u0a97\u0aa4\u0acb \u0aac\u0aa6\u0ab2\u0ac0 \u0ab6\u0a95\u0ac1\u0a82?",
  "faq.a4":
    "\u0ab9\u0abe. \u0aa4\u0aae\u0abe\u0ab0\u0abe \u0aaa\u0acd\u0ab0\u0ab8\u0a82\u0a97 \u0aaa\u0ab9\u0ac7\u0ab2\u0abe\u0a82 \u0a97\u0aae\u0ac7 \u0aa4\u0acd\u0aaf\u0abe\u0ab0\u0ac7 \u0aa8\u0abe\u0aae, \u0aa4\u0abe\u0ab0\u0ac0\u0a96\u0acb, \u0ab8\u0acd\u0aa5\u0ab3\u0acb \u0a85\u0aa5\u0ab5\u0abe \u0aab\u0acb\u0a9f\u0abe \u0aac\u0aa6\u0ab2\u0acb \u2014 \u0ab2\u0abf\u0a82\u0a95 \u0a8f \u0a9c \u0ab0\u0ab9\u0ac7 \u0a9b\u0ac7, \u0aa4\u0ac7\u0aa5\u0ac0 \u0aae\u0ab9\u0ac7\u0aae\u0abe\u0aa8\u0acb\u0aa8\u0ac7 \u0ab9\u0a82\u0aae\u0ac7\u0ab6\u0abe\u0a82 \u0aa8\u0ab5\u0ac0\u0aa8\u0aa4\u0aae \u0a86\u0ab5\u0ac3\u0aa4\u0acd\u0aa4\u0abf \u0aa6\u0ac7\u0a96\u0abe\u0aaf \u0a9b\u0ac7.",
  "faq.q5": "\u20b9599 \u0a95\u0ac7\u0aae?",
  "faq.a5":
    "\u0a86 \u0aa4\u0aae\u0abe\u0ab0\u0abe \u0a86\u0aae\u0a82\u0aa4\u0acd\u0ab0\u0aa3\u0aa8\u0ac7 \u0ab9\u0acb\u0ab8\u0acd\u0a9f \u0a95\u0ab0\u0ab5\u0abe\u0aa8\u0acb \u0a85\u0aa8\u0ac7 \u0a9a\u0ac1\u0a95\u0ab5\u0aa3\u0ac0 \u0a9a\u0ab2\u0abe\u0ab5\u0ab5\u0abe\u0aa8\u0acb \u0a96\u0ab0\u0acd\u0a9a \u0a86\u0ab5\u0ab0\u0ac0 \u0ab2\u0ac7 \u0a9b\u0ac7 \u2014 \u0ab8\u0ab0\u0acd\u0ab5\u0ab0 \u0a85\u0aa8\u0ac7 \u0aaa\u0ac7\u0aae\u0ac7\u0aa8\u0acd\u0a9f \u0a97\u0ac7\u0a9f\u0ab5\u0ac7 \u0aac\u0a82\u0aa8\u0ac7 \u0aaa\u0acd\u0ab0\u0aa4\u0abf \u0a86\u0aae\u0a82\u0aa4\u0acd\u0ab0\u0aa3 \u0a9a\u0abe\u0ab0\u0acd\u0a9c \u0ab2\u0ac7 \u0a9b\u0ac7. \u0a85\u0aae\u0ac7 \u0aa4\u0ac7\u0aa8\u0abe \u0aaa\u0ab0 \u0ab5\u0aa7\u0abe\u0ab0\u0ac7 \u0aa8\u0aab\u0acb \u0a95\u0aae\u0abe\u0ab5\u0abe\u0aa8\u0acb \u0aaa\u0acd\u0ab0\u0aaf\u0abe\u0ab8 \u0aa8\u0aa5\u0ac0 \u0a95\u0ab0\u0aa4\u0abe; \u0a85\u0aae\u0ac7 \u0a87\u0a9a\u0acd\u0a9b\u0ac0\u0a8f \u0a9b\u0ac0\u0a8f \u0a95\u0ac7 \u0aa4\u0aae\u0abe\u0ab0\u0ac0 \u0aaa\u0abe\u0ab8\u0ac7 \u0a8f\u0a95 \u0aae\u0ab9\u0abf\u0aa8\u0abe\u0aae\u0abe\u0a82 \u0a85\u0aa6\u0ac3\u0ab6\u0acd\u0aaf \u0aa5\u0a88 \u0a9c\u0aa4\u0abe \u0aae\u0aab\u0aa4 \u0a86\u0aae\u0a82\u0aa4\u0acd\u0ab0\u0aa3\u0aa8\u0ac7 \u0aac\u0aa6\u0ab2\u0ac7 \u0a8f\u0a95 \u0ab8\u0ac1\u0a82\u0aa6\u0ab0 \u0a86\u0aae\u0a82\u0aa4\u0acd\u0ab0\u0aa3 \u0ab9\u0acb\u0aaf.",
  "faq.q6":
    "\u0ab6\u0ac1\u0a82 \u0ab9\u0ac1\u0a82 \u0aae\u0abe\u0ab0\u0abe \u0aaa\u0acb\u0aa4\u0abe\u0aa8\u0abe \u0aab\u0acb\u0a9f\u0abe \u0a85\u0aa8\u0ac7 \u0ab8\u0a82\u0a97\u0ac0\u0aa4\u0aa8\u0acb \u0a89\u0aaa\u0aaf\u0acb\u0a97 \u0a95\u0ab0\u0ac0 \u0ab6\u0a95\u0ac1\u0a82?",
  "faq.a6":
    "\u0ab9\u0abe. \u0a97\u0ac7\u0ab2\u0ac7\u0ab0\u0ac0 \u0aae\u0abe\u0a9f\u0ac7 \u0aa4\u0aae\u0abe\u0ab0\u0abe \u0aaa\u0acb\u0aa4\u0abe\u0aa8\u0abe \u0aab\u0acb\u0a9f\u0acb\u0a97\u0acd\u0ab0\u0abe\u0aab \u0a85\u0aaa\u0ab2\u0acb\u0aa1 \u0a95\u0ab0\u0acb, \u0a85\u0aa8\u0ac7 \u0a85\u0aae\u0abe\u0ab0\u0ac0 \u0ab2\u0abe\u0a87\u0aac\u0acd\u0ab0\u0ac7\u0ab0\u0ac0\u0aae\u0abe\u0a82\u0aa5\u0ac0 \u0a9f\u0acd\u0ab0\u0ac7\u0a95 \u0aaa\u0ab8\u0a82\u0aa6 \u0a95\u0ab0\u0acb \u0a85\u0aa5\u0ab5\u0abe \u0aa4\u0aae\u0abe\u0ab0\u0ac1\u0a82 \u0aaa\u0acb\u0aa4\u0abe\u0aa8\u0ac1\u0a82 \u0a97\u0ac0\u0aa4 \u0a85\u0aaa\u0ab2\u0acb\u0aa1 \u0a95\u0ab0\u0acb \u2014 \u0a85\u0aaa\u0ab2\u0acb\u0aa1 \u0aa4\u0aae\u0abe\u0ab0\u0abe \u0a96\u0abe\u0aa4\u0abe\u0aae\u0abe\u0a82 \u0ab8\u0abe\u0a9a\u0ab5\u0abe\u0aaf \u0a9b\u0ac7, \u0aa4\u0ac7\u0aa5\u0ac0 \u0aa4\u0aae\u0ac7 \u0aaa\u0acd\u0ab0\u0a95\u0abe\u0ab6\u0abf\u0aa4 \u0a95\u0ab0\u0acb \u0aa4\u0acd\u0aaf\u0abe\u0ab0\u0ac7 \u0aa4\u0ac7 \u0aa4\u0acd\u0aaf\u0abe\u0a82 \u0ab9\u0acb\u0aaf \u0a9b\u0ac7. \u0a8f\u0a95 \u0aa1\u0abf\u0a9d\u0abe\u0a87\u0aa8, \u0aa6\u0ac1\u0aac\u0a88 \u0ab8\u0abf\u0ab2\u0acd\u0a95, \u0aaa\u0acb\u0aa4\u0abe\u0aa8\u0abe \u0aa5\u0ac0\u0aae \u0a9f\u0acd\u0ab0\u0ac7\u0a95 \u0ab8\u0abe\u0aa5\u0ac7 \u0a86\u0ab5\u0ac7 \u0a9b\u0ac7; \u0aac\u0abe\u0a95\u0ac0\u0aa8\u0ac0 \u0aa1\u0abf\u0a9d\u0abe\u0a87\u0aa8\u0acd\u0ab8 \u0aa4\u0aae\u0ac7 \u0ab8\u0a82\u0a97\u0ac0\u0aa4 \u0aaa\u0ab8\u0a82\u0aa6 \u0aa8 \u0a95\u0ab0\u0acb \u0aa4\u0acd\u0aaf\u0abe\u0a82 \u0ab8\u0ac1\u0aa7\u0ac0 \u0ab6\u0abe\u0a82\u0aa4 \u0ab0\u0ab9\u0ac7 \u0a9b\u0ac7.",
  "faq.q7":
    "\u0ab6\u0ac1\u0a82 \u0aae\u0ab9\u0ac7\u0aae\u0abe\u0aa8\u0acb\u0aa8\u0ac0 \u0ab8\u0a82\u0a96\u0acd\u0aaf\u0abe \u0a85\u0aa5\u0ab5\u0abe \u0ab2\u0abf\u0a82\u0a95 \u0a95\u0ac7\u0a9f\u0ab2\u0ac0 \u0ab5\u0abe\u0ab0 \u0a96\u0acb\u0ab2\u0abe\u0a88 \u0aa4\u0ac7\u0aa8\u0abe \u0aaa\u0ab0 \u0a95\u0acb\u0a88 \u0aae\u0ab0\u0acd\u0aaf\u0abe\u0aa6\u0abe \u0a9b\u0ac7?",
  "faq.a7":
    "\u0aa8\u0abe. \u0aa4\u0aae\u0aa8\u0ac7 \u0a97\u0aae\u0ac7 \u0aa4\u0ac7\u0a9f\u0ab2\u0abe \u0aae\u0ab9\u0ac7\u0aae\u0abe\u0aa8\u0acb \u0ab8\u0abe\u0aa5\u0ac7, \u0a97\u0aae\u0ac7 \u0aa4\u0ac7\u0a9f\u0ab2\u0abe \u0a9c\u0ac2\u0aa5\u0acb\u0aae\u0abe\u0a82 \u0aa4\u0aae\u0abe\u0ab0\u0ac0 \u0ab2\u0abf\u0a82\u0a95 \u0ab6\u0ac7\u0ab0 \u0a95\u0ab0\u0acb \u2014 \u0a95\u0acb\u0a88 \u0aae\u0ab9\u0ac7\u0aae\u0abe\u0aa8 \u0aae\u0ab0\u0acd\u0aaf\u0abe\u0aa6\u0abe \u0aa8\u0aa5\u0ac0 \u0a85\u0aa8\u0ac7 \u0a9c\u0acb\u0ab5\u0abe\u0aa8\u0ac0 \u0a95\u0acb\u0a88 \u0aae\u0ab0\u0acd\u0aaf\u0abe\u0aa6\u0abe \u0aa8\u0aa5\u0ac0.",
  "faq.q8":
    "\u0ab6\u0ac1\u0a82 \u0aae\u0ab9\u0ac7\u0aae\u0abe\u0aa8\u0acb\u0a8f \u0a95\u0a82\u0a88 \u0a87\u0aa8\u0acd\u0ab8\u0acd\u0a9f\u0acb\u0ab2 \u0a95\u0ab0\u0ab5\u0abe\u0aa8\u0ac0 \u0a85\u0aa5\u0ab5\u0abe \u0ab8\u0abe\u0a87\u0aa8 \u0a85\u0aaa \u0a95\u0ab0\u0ab5\u0abe\u0aa8\u0ac0 \u0a9c\u0ab0\u0ac2\u0ab0 \u0a9b\u0ac7?",
  "faq.a8":
    "\u0aa8\u0abe. \u0ab2\u0abf\u0a82\u0a95 \u0ab8\u0ac0\u0aa7\u0ac0 \u0aa4\u0ac7\u0aae\u0aa8\u0abe \u0aab\u0acb\u0aa8\u0aa8\u0abe \u0aac\u0acd\u0ab0\u0abe\u0a89\u0a9d\u0ab0\u0aae\u0abe\u0a82 \u0a96\u0ac2\u0ab2\u0ac7 \u0a9b\u0ac7 \u2014 \u0a95\u0acb\u0a88 \u0a8f\u0aaa \u0aa8\u0ab9\u0ac0\u0a82, \u0a95\u0acb\u0a88 \u0a8f\u0a95\u0abe\u0a89\u0aa8\u0acd\u0a9f \u0aa8\u0ab9\u0ac0\u0a82, \u0a87\u0aa8\u0acd\u0ab8\u0acd\u0a9f\u0acb\u0ab2 \u0a95\u0ab0\u0ab5\u0abe \u0a9c\u0ac7\u0ab5\u0ac1\u0a82 \u0a95\u0a82\u0a88 \u0aa8\u0ab9\u0ac0\u0a82.",
  "faq.q9":
    "\u0aaa\u0acd\u0ab0\u0a95\u0abe\u0ab6\u0abf\u0aa4 \u0a95\u0ab0\u0acd\u0aaf\u0abe \u0aaa\u0a9b\u0ac0 \u0a9c\u0acb \u0aa4\u0ac7 \u0a95\u0ac7\u0ab5\u0ac1\u0a82 \u0aa6\u0ac7\u0a96\u0abe\u0aaf \u0a9b\u0ac7 \u0aa4\u0ac7\u0aa8\u0abe\u0aa5\u0ac0 \u0ab9\u0ac1\u0a82 \u0a96\u0ac1\u0ab6 \u0aa8 \u0ab9\u0acb\u0a89\u0a82 \u0aa4\u0acb?",
  "faq.a9":
    "\u0aa4\u0aae\u0ac7 \u0a95\u0acb\u0a88\u0aaa\u0aa3 \u0ab5\u0aa7\u0abe\u0ab0\u0abe\u0aa8\u0abe \u0a96\u0ab0\u0acd\u0a9a \u0ab5\u0abf\u0aa8\u0abe \u0aaa\u0acd\u0ab0\u0a95\u0abe\u0ab6\u0abf\u0aa4 \u0a86\u0aae\u0a82\u0aa4\u0acd\u0ab0\u0aa3\u0aa8\u0ac7 \u0ab8\u0a82\u0aaa\u0abe\u0aa6\u0abf\u0aa4 \u0a95\u0ab0\u0aa4\u0abe \u0ab0\u0ab9\u0ac0 \u0ab6\u0a95\u0acb \u0a9b\u0acb. \u0a9c\u0acb \u0a95\u0a82\u0a88 \u0a96\u0ab0\u0ac7\u0a96\u0ab0 \u0aa4\u0ac2\u0a9f\u0ac7\u0ab2\u0ac1\u0a82 \u0ab9\u0acb\u0aaf, \u0aa4\u0acb \u0a85\u0aae\u0abe\u0ab0\u0ac0 \u0ab0\u0abf\u0aab\u0a82\u0aa1 \u0aa8\u0ac0\u0aa4\u0abf \u0a9c\u0ac1\u0a93 \u2014 \u0a85\u0aae\u0ac7 \u0aa4\u0ac7\u0aa8\u0ac7 \u0aa0\u0ac0\u0a95 \u0a95\u0ab0\u0ac0\u0ab6\u0ac1\u0a82 \u0a85\u0aa5\u0ab5\u0abe \u0aa4\u0aae\u0aa8\u0ac7 \u0ab0\u0abf\u0aab\u0a82\u0aa1 \u0a86\u0aaa\u0ac0\u0ab6\u0ac1\u0a82.",
  "faq.q10":
    "\u0a9c\u0acb \u0ab9\u0ac1\u0a82 \u0a85\u0a9f\u0ab5\u0abe\u0a88 \u0a9c\u0abe\u0a89\u0a82 \u0aa4\u0acb \u0ab6\u0ac1\u0a82 \u0aae\u0aa8\u0ac7 \u0aae\u0aa6\u0aa6 \u0aae\u0ab3\u0ac0 \u0ab6\u0a95\u0ac7?",
  "faq.a10":
    "\u0ab9\u0abe \u2014 \u0a85\u0aae\u0abe\u0ab0\u0abe \u0ab8\u0a82\u0aaa\u0ab0\u0acd\u0a95 \u0aaa\u0ac7\u0a9c \u0aaa\u0ab0\u0aa5\u0ac0 \u0a97\u0aae\u0ac7 \u0aa4\u0acd\u0aaf\u0abe\u0ab0\u0ac7 \u0a85\u0aae\u0abe\u0ab0\u0acb \u0ab8\u0a82\u0aaa\u0ab0\u0acd\u0a95 \u0a95\u0ab0\u0acb \u0a85\u0aa8\u0ac7 \u0a85\u0aae\u0ac7 \u0aa4\u0aae\u0abe\u0ab0\u0ac1\u0a82 \u0a86\u0aae\u0a82\u0aa4\u0acd\u0ab0\u0aa3 \u0aa4\u0ac8\u0aaf\u0abe\u0ab0 \u0a95\u0ab0\u0ab5\u0abe\u0aae\u0abe\u0a82 \u0aae\u0aa6\u0aa6 \u0a95\u0ab0\u0ac0\u0ab6\u0ac1\u0a82.",
  "closing.shubhVivah": "\u0ab6\u0ac1\u0aad \u0ab5\u0abf\u0ab5\u0abe\u0ab9",
  "closing.heading": "\u0a8f\u0a95",
  "closing.headingEm": "\u0ab8\u0ac1\u0a82\u0aa6\u0ab0",
  "closing.headingSuffix":
    "\u0aa8\u0aae\u0ab8\u0acd\u0aa4\u0ac7\u0aa5\u0ac0 \u0ab6\u0ab0\u0ac2\u0a86\u0aa4 \u0a95\u0ab0\u0acb.",
  "closing.createYours":
    "\u0aa4\u0aae\u0abe\u0ab0\u0ac1\u0a82 \u0aac\u0aa8\u0abe\u0ab5\u0acb",
};

const bn: Partial<Dictionary> = {
  "nav.designs": "ডিজাইন",
  "nav.howItWorks": "এটি কীভাবে কাজ করে",
  "nav.pricing": "মূল্য",
  "nav.faq": "সাধারণ জিজ্ঞাসা",
  "nav.createYours": "আপনারটি তৈরি করুন",
  "nav.signIn": "সাইন ইন করুন",
  "nav.dashboard": "ড্যাশবোর্ড",
  "nav.signOut": "সাইন আউট করুন",
  "nav.openMenu": "মেনু খুলুন",
  "nav.closeMenu": "মেনু বন্ধ করুন",
  "nav.primaryLabel": "প্রধান",
  "footer.tagline":
    "প্রতিটি অতিথির ফোনের জন্য অ্যানিমেটেড বিয়ের আমন্ত্রণ। কোনো ভৌত পণ্য পাঠানো হয় না।",
  "footer.explore": "দেখুন",
  "footer.policies": "নীতিমালা",
  "footer.terms": "শর্তাবলী",
  "footer.privacy": "গোপনীয়তা",
  "footer.refunds": "ফেরত",
  "footer.contact": "যোগাযোগ",
  "footer.copy": "ভালোবাসা দিয়ে তৈরি, ভালোবাসার জন্য।",
  "hero.eyebrow": "ডিজিটাল বিয়ের আমন্ত্রণ",
  "hero.titleLine1": "একটি আমন্ত্রণ",
  "hero.titleOpenPrefix": "যা তারা ",
  "hero.titleOpen": "দুইবার খুলবে",
  "hero.titleLine3": "",
  "hero.lede":
    "খাম যা খোলে, প্রাসাদের দরজা যা আলাদা হয়, সোনালী ফয়েলের নিচে প্রকাশিত তারিখ। আপনার বিশেষ দিনের জন্য আপনার নিজস্ব ব্যক্তিগত ওয়েবপেজ — একটি হোয়াটসঅ্যাপ লিঙ্কে শেয়ার করুন।",
  "hero.browseDesigns": "{count}টি ডিজাইন দেখুন",
  "hero.noteStrong": "আনলিমিটেড কাস্টমাইজেশন",
  "hero.noteRest": "সবসময় বিনামূল্যে",
  "theme.preview": "প্রিভিউ",
  "theme.useDesign": "এই ডিজাইন ব্যবহার করুন",
  "editor.design": "ডিজাইন",
  "editor.yourNames": "আপনাদের নাম",
  "editor.name": "নাম",
  "editor.partnersName": "সঙ্গীর নাম",
  "editor.families": "পরিবার",
  "editor.familiesNote":
    "ভারতীয় আমন্ত্রণে বাবা-মায়ের নাম দেওয়া হয়; বাদ দিতে চাইলে খালি রাখুন।",
  "editor.firstSide": "প্রথম পক্ষ",
  "editor.secondSide": "দ্বিতীয় পক্ষ",
  "editor.parents": "বাবা-মা",
  "editor.grandparents": "দাদা-দাদি/নানা-নানি",
  "editor.qualifications": "যোগ্যতা",
  "editor.openingText": "শুরুর লেখা",
  "editor.openingTextHint":
    "ঐচ্ছিক — বেশিরভাগ আমন্ত্রণ মূল ছবি থেকে সরাসরি নামে চলে যায়, যা সবচেয়ে পরিষ্কার দেখায়। নামের উপরে একটি লাইন চাইলে তবেই এটি পূরণ করুন।",
  "editor.welcomeLine": "স্বাগত লাইন",
  "editor.blessingOrVerse": "আশীর্বাদ বা পঙ্‌ক্তি",
  "editor.attribution": "কৃতিত্ব",
  "editor.theDay": "দিন",
  "editor.occasion": "উপলক্ষ",
  "editor.dateAndTime": "তারিখ ও সময়",
  "editor.venue": "স্থান",
  "editor.googleMapsLink": "গুগল ম্যাপস লিঙ্ক",
  "editor.mapsHint":
    "ঐচ্ছিক — খালি রাখুন এবং স্থানের নামে ট্যাপ করলে স্বয়ংক্রিয়ভাবে গুগল ম্যাপসে খোঁজা হবে। নির্দিষ্ট পিনে অতিথিদের পাঠাতে চাইলে তবেই এখানে লিঙ্ক দিন।",
  "editor.yourFunctions": "আপনাদের অনুষ্ঠান",
  "editor.addFunction": "অনুষ্ঠান যোগ করুন",
  "editor.replies": "উত্তর",
  "editor.whatsappNumber": "হোয়াটসঅ্যাপ নম্বর",
  "editor.replyBy": "এই তারিখের মধ্যে উত্তর দিন",
  "editor.yourHashtag": "আপনাদের হ্যাশট্যাগ",
  "editor.travelStay": "ভ্রমণ ও থাকার ব্যবস্থা",
  "editor.gettingThere": "সেখানে কীভাবে পৌঁছাবেন",
  "editor.whereToStay": "কোথায় থাকবেন",
  "editor.goodToKnow": "জেনে রাখা ভালো",
  "editor.music": "সঙ্গীত",
  "editor.photos": "ছবি",
  "editor.yourStory": "আপনাদের গল্প",
  "editor.lineForGuests": "অতিথিদের জন্য একটি লাইন",
  "editor.togetherSince": "কবে থেকে একসাথে",
  "editor.replayOpening": "শুরুটা আবার দেখুন",
  "editor.previewNote":
    "এটি একটি লাইভ প্রিভিউ — বাঁদিকে করা প্রতিটি পরিবর্তন এখানে সাথে সাথে দেখা যায়। কোনো ফিল্ড খালি রাখলে তা আপনার আমন্ত্রণে একেবারেই দেখা যাবে না; কখনো কোনো খালি লাইন বা প্লেসহোল্ডার টেক্সট দেখা যায় না। নমুনা ছবি শুধুমাত্র এই প্রিভিউতে খালি ছবির স্থানগুলিতে দেখা যেতে পারে — আপনি নিজের ছবি যোগ না করা পর্যন্ত অতিথিরা সেই স্থানগুলি খালি দেখেন।",
  "collection.eyebrow": "\u09b8\u0982\u0997\u09cd\u09b0\u09b9",
  "collection.heading":
    "{count}\u099f\u09bf \u0989\u09aa\u09be\u09af\u09bc \u09ac\u09b2\u09be\u09b0",
  "collection.headingEm": "\u09b8\u09c7\u09ad \u09a6\u09cd\u09af \u09a1\u09c7\u099f",
  "collection.sub":
    "\u09aa\u09cd\u09b0\u09a4\u09bf\u099f\u09bf \u09a1\u09bf\u099c\u09be\u0987\u09a8 \u09aa\u09cd\u09b0\u09a5\u09ae \u099f\u09cd\u09af\u09be\u09aa \u09a5\u09c7\u0995\u09c7 \u09b6\u09c7\u09b7 \u0995\u09be\u0989\u09a8\u09cd\u099f\u09a1\u09be\u0989\u09a8 \u09aa\u09b0\u09cd\u09af\u09a8\u09cd\u09a4 \u098f\u0995\u099f\u09bf \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u0985\u09cd\u09af\u09be\u09a8\u09bf\u09ae\u09c7\u099f\u09c7\u09a1 \u0985\u09ad\u09bf\u099c\u09cd\u099e\u09a4\u09be\u0964",
  "collection.seeAll":
    "\u09b8\u09ac {count}\u099f\u09bf \u09a1\u09bf\u099c\u09be\u0987\u09a8 \u09a6\u09c7\u0996\u09c1\u09a8",
  "how.eyebrow":
    "\u098f\u099f\u09bf \u0995\u09c0\u09ad\u09be\u09ac\u09c7 \u0995\u09be\u099c \u0995\u09b0\u09c7",
  "how.heading": "\u098f\u0995 \u09b8\u09a8\u09cd\u09a7\u09cd\u09af\u09be\u09af\u09bc",
  "how.headingEm": "\u09aa\u09cd\u09b0\u09b8\u09cd\u09a4\u09c1\u09a4",
  "steps.1.title":
    "\u098f\u0995\u099f\u09bf \u09a1\u09bf\u099c\u09be\u0987\u09a8 \u09ac\u09c7\u099b\u09c7 \u09a8\u09bf\u09a8",
  "steps.1.body":
    "{count}\u099f\u09bf \u0985\u09cd\u09af\u09be\u09a8\u09bf\u09ae\u09c7\u099f\u09c7\u09a1 \u0986\u09ae\u09a8\u09cd\u09a4\u09cd\u09b0\u09a3\u09aa\u09a4\u09cd\u09b0 \u09a6\u09c7\u0996\u09c1\u09a8 \u2014 \u09b0\u09be\u099c\u0995\u09c0\u09af\u09bc, \u0986\u09a7\u09c1\u09a8\u09bf\u0995, \u09ab\u09c1\u09b2\u09c7\u09b2, \u0997\u09a8\u09cd\u09a4\u09ac\u09cd\u09af\u0964 \u09aa\u09cd\u09b0\u09a4\u09bf\u099f\u09bf \u09a0\u09bf\u0995 \u09af\u09c7\u09ae\u09a8 \u0986\u09aa\u09a8\u09be\u09b0 \u0985\u09a4\u09bf\u09a5\u09bf\u09b0\u09be \u09a6\u09c7\u0996\u09ac\u09c7\u09a8 \u09a4\u09c7\u09ae\u09a8\u0987 \u09aa\u09c2\u09b0\u09cd\u09ac\u09b0\u09c2\u09aa \u09a6\u09c7\u0996\u09c1\u09a8\u0964",
  "steps.2.title":
    "\u09ac\u09bf\u09a8\u09be\u09ae\u09c2\u09b2\u09cd\u09af\u09c7 \u0995\u09be\u09b8\u09cd\u099f\u09ae\u09be\u0987\u099c \u0995\u09b0\u09c1\u09a8",
  "steps.2.body":
    "\u0986\u09aa\u09a8\u09be\u09b0 \u09a8\u09be\u09ae, \u09a4\u09be\u09b0\u09bf\u0996, \u09b8\u09cd\u09a5\u09be\u09a8, \u09b9\u09b2\u09c1\u09a6 \u09a5\u09c7\u0995\u09c7 \u09b0\u09bf\u09b8\u09c7\u09aa\u09b6\u09a8 \u09aa\u09b0\u09cd\u09af\u09a8\u09cd\u09a4 \u09aa\u09cd\u09b0\u09a4\u09bf\u099f\u09bf \u0985\u09a8\u09c1\u09b7\u09cd\u09a0\u09be\u09a8, \u0986\u09aa\u09a8\u09be\u09b0 \u099b\u09ac\u09bf \u098f\u09ac\u0982 \u0997\u09be\u09a8 \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8\u0964 \u09af\u09a4\u09ac\u09be\u09b0 \u0996\u09c1\u09b6\u09bf \u09b8\u09ae\u09cd\u09aa\u09be\u09a6\u09a8\u09be \u0995\u09b0\u09c1\u09a8\u0964",
  "steps.3.title":
    "\u098f\u0995\u09ac\u09be\u09b0 \u0985\u09b0\u09cd\u09a5 \u09aa\u09cd\u09b0\u09a6\u09be\u09a8 \u0995\u09b0\u09c1\u09a8, \u09b6\u09c7\u09af\u09bc\u09be\u09b0 \u0995\u09b0\u09c1\u09a8",
  "steps.3.body":
    "\u20b9599-\u09a4\u09c7 \u09aa\u09cd\u09b0\u0995\u09be\u09b6 \u0995\u09b0\u09c1\u09a8 \u098f\u09ac\u0982 \u09a8\u09bf\u099c\u09c7\u09b0 \u09b2\u09bf\u0999\u09cd\u0995 \u09aa\u09be\u09a8\u0964 \u098f\u099f\u09bf \u09b9\u09cb\u09af\u09bc\u09be\u099f\u09b8\u0985\u09cd\u09af\u09be\u09aa, \u0987\u09a8\u09b8\u09cd\u099f\u09be\u0997\u09cd\u09b0\u09be\u09ae, \u09af\u09c7\u0995\u09cb\u09a8\u09cb \u099c\u09be\u09af\u09bc\u0997\u09be\u09af\u09bc \u09aa\u09be\u09a0\u09be\u09a8 \u2014 \u098f\u099f\u09bf \u09af\u09c7\u0995\u09cb\u09a8\u09cb \u09ab\u09cb\u09a8\u09c7 \u09b8\u09c1\u09a8\u09cd\u09a6\u09b0\u09ad\u09be\u09ac\u09c7 \u0996\u09cb\u09b2\u09c7\u0964",
  "compare.eyebrow":
    "\u0995\u09c7\u09a8 \u09a1\u09bf\u099c\u09bf\u099f\u09be\u09b2 \u09ac\u09c7\u099b\u09c7 \u09a8\u09c7\u09ac\u09c7\u09a8",
  "compare.heading": "\u0995\u09be\u0997\u099c",
  "compare.headingEm": "\u09ac\u09a8\u09be\u09ae",
  "compare.headingSuffix": "\u09a1\u09bf\u099c\u09bf\u099f\u09be\u09b2",
  "compare.colFeature": "\u09ac\u09c8\u09b6\u09bf\u09b7\u09cd\u099f\u09cd\u09af",
  "compare.colPaper": "\u0995\u09be\u0997\u099c",
  "compare.colDigital": "\u09a1\u09bf\u099c\u09bf\u099f\u09be\u09b2",
  "compare.row.cost.feature": "\u0996\u09b0\u099a",
  "compare.row.cost.paper":
    "\u09aa\u09cd\u09b0\u09a4\u09bf \u0995\u09be\u09b0\u09cd\u09a1\u09c7 \u20b9150\u2013\u20b9500+, \u09aa\u09cd\u09b2\u09be\u09b8 \u099b\u09be\u09aa\u09be",
  "compare.row.cost.digital": "\u20b9599 \u098f\u0995\u09ac\u09be\u09b0",
  "compare.row.delivery.feature":
    "\u09a1\u09c7\u09b2\u09bf\u09ad\u09be\u09b0\u09bf\u09b0 \u09b8\u09ae\u09af\u09bc",
  "compare.row.delivery.paper":
    "\u099b\u09be\u09aa\u09be \u0993 \u0995\u09c1\u09b0\u09bf\u09af\u09bc\u09be\u09b0\u09c7\u09b0 \u099c\u09a8\u09cd\u09af 1\u20132 \u09b8\u09aa\u09cd\u09a4\u09be\u09b9",
  "compare.row.delivery.digital":
    "\u09a4\u09be\u09ce\u0995\u09cd\u09b7\u09a3\u09bf\u0995",
  "compare.row.animation.feature":
    "\u0993\u09aa\u09c7\u09a8\u09bf\u0982 \u0985\u09cd\u09af\u09be\u09a8\u09bf\u09ae\u09c7\u09b6\u09a8",
  "compare.row.music.feature":
    "\u09ac\u09cd\u09af\u09be\u0995\u0997\u09cd\u09b0\u09be\u0989\u09a8\u09cd\u09a1 \u09ae\u09bf\u0989\u099c\u09bf\u0995",
  "compare.row.countdown.feature":
    "\u09b2\u09be\u0987\u09ad \u0995\u09be\u0989\u09a8\u09cd\u099f\u09a1\u09be\u0989\u09a8",
  "compare.row.editable.feature":
    "\u09aa\u09be\u09a0\u09be\u09a8\u09cb\u09b0 \u09aa\u09b0\u09c7\u0993 \u09b8\u09ae\u09cd\u09aa\u09be\u09a6\u09a8\u09be\u09af\u09cb\u0997\u09cd\u09af",
  "compare.row.maps.feature":
    "\u0997\u09c1\u0997\u09b2 \u09ae\u09cd\u09af\u09be\u09aa\u09b8 \u09a6\u09bf\u0995\u09a8\u09bf\u09b0\u09cd\u09a6\u09c7\u09b6",
  "compare.row.guests.feature":
    "\u0985\u09b8\u09c0\u09ae\u09bf\u09a4 \u0985\u09a4\u09bf\u09a5\u09bf \u0993 \u09b6\u09c7\u09af\u09bc\u09be\u09b0",
  "compare.row.whatsapp.feature":
    "\u09b9\u09cb\u09af\u09bc\u09be\u099f\u09b8\u0985\u09cd\u09af\u09be\u09aa\u09c7 \u09b6\u09c7\u09af\u09bc\u09be\u09b0\u09af\u09cb\u0997\u09cd\u09af",
  "pricing.eyebrow": "\u09ae\u09c2\u09b2\u09cd\u09af",
  "pricing.heading1": "\u098f\u0995\u099f\u09bf \u09ae\u09c2\u09b2\u09cd\u09af\u0964",
  "pricing.heading2":
    "\u0995\u09cb\u09a8\u09cb \u09b8\u09be\u09ac\u09b8\u09cd\u0995\u09cd\u09b0\u09bf\u09aa\u09b6\u09a8 \u09a8\u09c7\u0987\u0964",
  "pricing.body":
    "\u0995\u09cb\u09a8\u09cb \u0996\u09b0\u099a \u099b\u09be\u09a1\u09bc\u09be\u0987 \u09af\u09a4\u0995\u09cd\u09b7\u09a3 \u0996\u09c1\u09b6\u09bf \u09a1\u09bf\u099c\u09be\u0987\u09a8 \u0993 \u09aa\u09c2\u09b0\u09cd\u09ac\u09b0\u09c2\u09aa \u09a6\u09c7\u0996\u09c1\u09a8\u0964 \u09ac\u09bf\u09b6\u09cd\u09ac\u09c7\u09b0 \u09b8\u09be\u09a5\u09c7 \u09b6\u09c7\u09af\u09bc\u09be\u09b0 \u0995\u09b0\u09a4\u09c7 \u09aa\u09cd\u09b0\u09b8\u09cd\u09a4\u09c1\u09a4 \u09b9\u09b2\u09c7\u0987 \u0995\u09c7\u09ac\u09b2 \u0985\u09b0\u09cd\u09a5 \u09aa\u09cd\u09b0\u09a6\u09be\u09a8 \u0995\u09b0\u09c1\u09a8\u0964",
  "pricing.theInvitation":
    "\u0986\u09ae\u09a8\u09cd\u09a4\u09cd\u09b0\u09a3\u09aa\u09a4\u09cd\u09b0",
  "pricing.oneTime": "\u098f\u0995\u09ac\u09be\u09b0",
  "pricing.startCustomising":
    "\u09ac\u09bf\u09a8\u09be\u09ae\u09c2\u09b2\u09cd\u09af\u09c7 \u0995\u09be\u09b8\u09cd\u099f\u09ae\u09be\u0987\u099c \u0995\u09b0\u09be \u09b6\u09c1\u09b0\u09c1 \u0995\u09b0\u09c1\u09a8",
  "included.0":
    "\u0986\u09ae\u09be\u09a6\u09c7\u09b0 {count} \u0985\u09cd\u09af\u09be\u09a8\u09bf\u09ae\u09c7\u099f\u09c7\u09a1 \u09a1\u09bf\u099c\u09be\u0987\u09a8\u09c7\u09b0 \u09af\u09c7\u0995\u09cb\u09a8\u09cb\u099f\u09bf",
  "included.1":
    "\u0985\u09b8\u09c0\u09ae\u09bf\u09a4 \u0985\u09a8\u09c1\u09b7\u09cd\u09a0\u09be\u09a8 \u2014 \u09b9\u09b2\u09c1\u09a6 \u09a5\u09c7\u0995\u09c7 \u09b0\u09bf\u09b8\u09c7\u09aa\u09b6\u09a8 \u09aa\u09b0\u09cd\u09af\u09a8\u09cd\u09a4",
  "included.2":
    "\u099b\u09ac\u09bf\u09b0 \u0997\u09cd\u09af\u09be\u09b2\u09be\u09b0\u09bf, \u09b8\u0999\u09cd\u0997\u09c0\u09a4 \u0993 \u09b2\u09be\u0987\u09ad \u0995\u09be\u0989\u09a8\u09cd\u099f\u09a1\u09be\u0989\u09a8",
  "included.3":
    "\u09aa\u09cd\u09b0\u09a4\u09bf\u099f\u09bf \u09b8\u09cd\u09a5\u09be\u09a8\u09c7\u09b0 \u099c\u09a8\u09cd\u09af \u0997\u09c1\u0997\u09b2 \u09ae\u09cd\u09af\u09be\u09aa\u09b8 \u09a6\u09bf\u0995\u09a8\u09bf\u09b0\u09cd\u09a6\u09c7\u09b6",
  "included.4":
    "\u0985\u09b8\u09c0\u09ae\u09bf\u09a4 \u0985\u09a4\u09bf\u09a5\u09bf, \u0985\u09b8\u09c0\u09ae\u09bf\u09a4 \u09b6\u09c7\u09af\u09bc\u09be\u09b0",
  "included.5":
    "\u09aa\u09cd\u09b0\u0995\u09be\u09b6\u09c7\u09b0 \u09aa\u09b0\u09c7 \u09af\u09c7\u0995\u09cb\u09a8\u09cb \u09b8\u09ae\u09af\u09bc \u09ac\u09bf\u09ac\u09b0\u09a3 \u09b8\u09ae\u09cd\u09aa\u09be\u09a6\u09a8\u09be \u0995\u09b0\u09c1\u09a8",
  "faq.eyebrow": "\u09aa\u09cd\u09b0\u09b6\u09cd\u09a8\u09be\u09ac\u09b2\u09c0",
  "faq.heading": "\u09b6\u09c1\u09b0\u09c1 \u0995\u09b0\u09be\u09b0",
  "faq.headingEm": "\u0986\u0997\u09c7",
  "faq.q0":
    "\u09a1\u09bf\u099c\u09be\u0987\u09a8 \u0995\u09b0\u09be \u0995\u09bf \u09b8\u09a4\u09cd\u09af\u09bf\u0987 \u09ac\u09bf\u09a8\u09be\u09ae\u09c2\u09b2\u09cd\u09af\u09c7?",
  "faq.a0":
    "হ্যাঁ। যেকোনো ডিজাইন বেছে নিন, আপনার নাম, তারিখ ও স্থান যোগ করুন, এবং পুরো জিনিসটি নিজের ফোনে পূর্বরূপ দেখুন — সবই বিনামূল্যে। নিজের ছবি বা গান যোগ করতে শুধু একটি বিনামূল্যের অ্যাকাউন্ট লাগে। আপনি শুধুমাত্র প্রকাশ করার সময় অর্থ প্রদান করেন।",
  "faq.q1":
    "\u20b9599 \u0986\u09b8\u09b2\u09c7 \u0995\u09c0\u09b8\u09c7\u09b0 \u099c\u09a8\u09cd\u09af?",
  "faq.a1":
    "\u098f\u0995\u099f\u09bf \u0986\u09ae\u09a8\u09cd\u09a4\u09cd\u09b0\u09a3\u09aa\u09a4\u09cd\u09b0, \u098f\u0995\u09ac\u09be\u09b0 \u09aa\u09cd\u09b0\u0995\u09be\u09b6\u09bf\u09a4, \u09a8\u09bf\u099c\u09b8\u09cd\u09ac \u09b6\u09c7\u09af\u09bc\u09be\u09b0\u09af\u09cb\u0997\u09cd\u09af \u09b2\u09bf\u0999\u09cd\u0995\u09b8\u09b9 \u2014 \u0995\u09cb\u09a8\u09cb \u0993\u09af\u09bc\u09be\u099f\u09be\u09b0\u09ae\u09be\u09b0\u09cd\u0995 \u09a8\u09c7\u0987, \u0995\u09cb\u09a8\u09cb \u09b8\u09be\u09ac\u09b8\u09cd\u0995\u09cd\u09b0\u09bf\u09aa\u09b6\u09a8 \u09a8\u09c7\u0987, \u09aa\u09cd\u09b0\u09a4\u09bf \u0985\u09a4\u09bf\u09a5\u09bf\u09b0 \u099a\u09be\u09b0\u09cd\u099c \u09a8\u09c7\u0987\u0964 \u09ac\u09bf\u09af\u09bc\u09c7 \u09aa\u09b0\u09cd\u09af\u09a8\u09cd\u09a4 \u0986\u09aa\u09a8\u09bf \u098f\u099f\u09bf \u09aa\u09cd\u09b0\u0995\u09be\u09b6\u09c7\u09b0 \u09aa\u09b0\u09c7\u0993 \u09b8\u09ae\u09cd\u09aa\u09be\u09a6\u09a8\u09be \u0995\u09b0\u09a4\u09c7 \u09aa\u09be\u09b0\u09ac\u09c7\u09a8\u0964",
  "faq.q2":
    "\u0986\u09ae\u09bf \u0995\u09bf \u09b9\u09b2\u09c1\u09a6, \u09b8\u0982\u0997\u09c0\u09a4 \u098f\u09ac\u0982 \u09b0\u09bf\u09b8\u09c7\u09aa\u09b6\u09a8 \u0986\u09b2\u09be\u09a6\u09be\u09ad\u09be\u09ac\u09c7 \u09af\u09cb\u0997 \u0995\u09b0\u09a4\u09c7 \u09aa\u09be\u09b0\u09bf?",
  "faq.a2":
    "\u09b9\u09cd\u09af\u09be\u0981 \u2014 \u0986\u09aa\u09a8\u09bf \u09af\u09a4 \u0996\u09c1\u09b6\u09bf \u0985\u09a8\u09c1\u09b7\u09cd\u09a0\u09be\u09a8 \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8, \u09aa\u09cd\u09b0\u09a4\u09bf\u099f\u09bf\u09b0 \u09a8\u09bf\u099c\u09b8\u09cd\u09ac \u09a4\u09be\u09b0\u09bf\u0996, \u09b8\u09ae\u09af\u09bc, \u09b8\u09cd\u09a5\u09be\u09a8 \u098f\u09ac\u0982 \u09a1\u09cd\u09b0\u09c7\u09b8 \u0995\u09cb\u09a1\u09b8\u09b9, \u09b8\u09ac\u0987 \u098f\u0995\u099f\u09bf \u0986\u09ae\u09a8\u09cd\u09a4\u09cd\u09b0\u09a3 \u09b2\u09bf\u0999\u09cd\u0995\u09c7\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7\u0964",
  "faq.q3":
    "\u09af\u09c7\u09b8\u09ac \u0985\u09a4\u09bf\u09a5\u09bf \u09b9\u09cb\u09af\u09bc\u09be\u099f\u09b8\u0985\u09cd\u09af\u09be\u09aa\u09c7 \u09a8\u09c7\u0987 \u09a4\u09be\u09a6\u09c7\u09b0 \u099c\u09a8\u09cd\u09af \u0995\u09bf \u098f\u099f\u09bf \u0995\u09be\u099c \u0995\u09b0\u09ac\u09c7?",
  "faq.a3":
    "\u09b2\u09bf\u0999\u09cd\u0995\u099f\u09bf \u098f\u0995\u099f\u09bf \u09b8\u09be\u09a7\u09be\u09b0\u09a3 \u0993\u09af\u09bc\u09c7\u09ac \u09aa\u09c7\u099c, \u09a4\u09be\u0987 \u098f\u099f\u09bf \u098f\u09b8\u098f\u09ae\u098f\u09b8, \u0987\u09a8\u09b8\u09cd\u099f\u09be\u0997\u09cd\u09b0\u09be\u09ae, \u0987\u09ae\u09c7\u0987\u09b2 \u09ac\u09be \u0985\u09a8\u09cd\u09af \u09af\u09c7\u0995\u09cb\u09a8\u09cb \u0985\u09cd\u09af\u09be\u09aa\u09c7 \u098f\u0995\u0987\u09ad\u09be\u09ac\u09c7 \u0996\u09cb\u09b2\u09c7 \u2014 \u09b9\u09cb\u09af\u09bc\u09be\u099f\u09b8\u0985\u09cd\u09af\u09be\u09aa \u09b6\u09c1\u09a7\u09c1 \u09aa\u09be\u09a0\u09be\u09a8\u09cb\u09b0 \u09b8\u09ac\u099a\u09c7\u09af\u09bc\u09c7 \u09b8\u09b9\u099c \u0989\u09aa\u09be\u09af\u09bc\u0964",
  "faq.q4":
    "\u09b2\u09bf\u0999\u09cd\u0995 \u09b6\u09c7\u09af\u09bc\u09be\u09b0 \u0995\u09b0\u09be\u09b0 \u09aa\u09b0\u09c7 \u0995\u09bf \u0986\u09ae\u09bf \u09ac\u09bf\u09ac\u09b0\u09a3 \u09aa\u09b0\u09bf\u09ac\u09b0\u09cd\u09a4\u09a8 \u0995\u09b0\u09a4\u09c7 \u09aa\u09be\u09b0\u09bf?",
  "faq.a4":
    "\u09b9\u09cd\u09af\u09be\u0981\u0964 \u0986\u09aa\u09a8\u09be\u09b0 \u0985\u09a8\u09c1\u09b7\u09cd\u09a0\u09be\u09a8\u09c7\u09b0 \u0986\u0997\u09c7 \u09af\u09c7\u0995\u09cb\u09a8\u09cb \u09b8\u09ae\u09af\u09bc \u09a8\u09be\u09ae, \u09a4\u09be\u09b0\u09bf\u0996, \u09b8\u09cd\u09a5\u09be\u09a8 \u09ac\u09be \u099b\u09ac\u09bf \u09b8\u09ae\u09cd\u09aa\u09be\u09a6\u09a8\u09be \u0995\u09b0\u09c1\u09a8 \u2014 \u09b2\u09bf\u0999\u09cd\u0995 \u098f\u0995\u0987 \u09a5\u09be\u0995\u09c7, \u09a4\u09be\u0987 \u0985\u09a4\u09bf\u09a5\u09bf\u09b0\u09be \u09b8\u09ac\u09b8\u09ae\u09af\u09bc \u09b8\u09b0\u09cd\u09ac\u09b6\u09c7\u09b7 \u09b8\u0982\u09b8\u09cd\u0995\u09b0\u09a3 \u09a6\u09c7\u0996\u09a4\u09c7 \u09aa\u09be\u09a8\u0964",
  "faq.q5": "\u0995\u09c7\u09a8 \u20b9599?",
  "faq.a5":
    "\u098f\u099f\u09bf \u0986\u09aa\u09a8\u09be\u09b0 \u0986\u09ae\u09a8\u09cd\u09a4\u09cd\u09b0\u09a3\u09aa\u09a4\u09cd\u09b0 \u09b9\u09cb\u09b8\u09cd\u099f \u0995\u09b0\u09be \u098f\u09ac\u0982 \u09aa\u09c7\u09ae\u09c7\u09a8\u09cd\u099f \u099a\u09be\u09b2\u09be\u09a8\u09cb\u09b0 \u0996\u09b0\u099a \u09ac\u09b9\u09a8 \u0995\u09b0\u09c7 \u2014 \u09b8\u09be\u09b0\u09cd\u09ad\u09be\u09b0 \u098f\u09ac\u0982 \u09aa\u09c7\u09ae\u09c7\u09a8\u09cd\u099f \u0997\u09c7\u099f\u0993\u09af\u09bc\u09c7 \u0989\u09ad\u09af\u09bc\u0987 \u09aa\u09cd\u09b0\u09a4\u09bf \u0986\u09ae\u09a8\u09cd\u09a4\u09cd\u09b0\u09a3\u09c7 \u099a\u09be\u09b0\u09cd\u099c \u0995\u09b0\u09c7\u0964 \u0986\u09ae\u09b0\u09be \u098f\u09b0 \u0989\u09aa\u09b0 \u09ac\u09c7\u09b6\u09bf \u09b2\u09be\u09ad \u0995\u09b0\u09be\u09b0 \u099a\u09c7\u09b7\u09cd\u099f\u09be \u0995\u09b0\u099b\u09bf \u09a8\u09be; \u0986\u09ae\u09b0\u09be \u099a\u09be\u0987 \u0986\u09aa\u09a8\u09be\u09b0 \u0995\u09be\u099b\u09c7 \u098f\u0995 \u09ae\u09be\u09b8\u09c7 \u0985\u09a6\u09c3\u09b6\u09cd\u09af \u09b9\u09af\u09bc\u09c7 \u09af\u09be\u0993\u09af\u09bc\u09be \u098f\u0995\u099f\u09bf \u09ac\u09bf\u09a8\u09be\u09ae\u09c2\u09b2\u09cd\u09af\u09c7\u09b0 \u0986\u09ae\u09a8\u09cd\u09a4\u09cd\u09b0\u09a3\u09c7\u09b0 \u09aa\u09b0\u09bf\u09ac\u09b0\u09cd\u09a4\u09c7 \u098f\u0995\u099f\u09bf \u09b8\u09c1\u09a8\u09cd\u09a6\u09b0 \u0986\u09ae\u09a8\u09cd\u09a4\u09cd\u09b0\u09a3 \u09a5\u09be\u0995\u09c1\u0995\u0964",
  "faq.q6":
    "\u0986\u09ae\u09bf \u0995\u09bf \u09a8\u09bf\u099c\u09c7\u09b0 \u099b\u09ac\u09bf \u098f\u09ac\u0982 \u0997\u09be\u09a8 \u09ac\u09cd\u09af\u09ac\u09b9\u09be\u09b0 \u0995\u09b0\u09a4\u09c7 \u09aa\u09be\u09b0\u09bf?",
  "faq.a6":
    "\u09b9\u09cd\u09af\u09be\u0981\u0964 \u0997\u09cd\u09af\u09be\u09b2\u09be\u09b0\u09bf\u09b0 \u099c\u09a8\u09cd\u09af \u09a8\u09bf\u099c\u09c7\u09b0 \u099b\u09ac\u09bf \u0986\u09aa\u09b2\u09cb\u09a1 \u0995\u09b0\u09c1\u09a8, \u098f\u09ac\u0982 \u0986\u09ae\u09be\u09a6\u09c7\u09b0 \u09b2\u09be\u0987\u09ac\u09cd\u09b0\u09c7\u09b0\u09bf \u09a5\u09c7\u0995\u09c7 \u098f\u0995\u099f\u09bf \u099f\u09cd\u09b0\u09cd\u09af\u09be\u0995 \u09ac\u09c7\u099b\u09c7 \u09a8\u09bf\u09a8 \u09ac\u09be \u09a8\u09bf\u099c\u09c7\u09b0 \u0997\u09be\u09a8 \u0986\u09aa\u09b2\u09cb\u09a1 \u0995\u09b0\u09c1\u09a8 \u2014 \u0986\u09aa\u09b2\u09cb\u09a1\u0997\u09c1\u09b2\u09bf \u0986\u09aa\u09a8\u09be\u09b0 \u0985\u09cd\u09af\u09be\u0995\u09be\u0989\u09a8\u09cd\u099f\u09c7 \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u09b9\u09af\u09bc, \u09a4\u09be\u0987 \u0986\u09aa\u09a8\u09bf \u09aa\u09cd\u09b0\u0995\u09be\u09b6 \u0995\u09b0\u09be\u09b0 \u09b8\u09ae\u09af\u09bc \u09b8\u09c7\u0997\u09c1\u09b2\u09bf \u09b8\u09c7\u0996\u09be\u09a8\u09c7 \u09a5\u09be\u0995\u09c7\u0964 \u098f\u0995\u099f\u09bf \u09a1\u09bf\u099c\u09be\u0987\u09a8, \u09a6\u09c1\u09ac\u09be\u0987 \u09b8\u09bf\u09b2\u09cd\u0995, \u09a4\u09be\u09b0 \u09a8\u09bf\u099c\u09b8\u09cd\u09ac \u09a5\u09bf\u09ae \u099f\u09cd\u09b0\u09cd\u09af\u09be\u0995 \u09b8\u09b9 \u0986\u09b8\u09c7; \u0985\u09a8\u09cd\u09af \u09a1\u09bf\u099c\u09be\u0987\u09a8\u0997\u09c1\u09b2\u09cb \u0986\u09aa\u09a8\u09bf \u09b8\u0999\u09cd\u0997\u09c0\u09a4 \u09a8\u09bf\u09b0\u09cd\u09ac\u09be\u099a\u09a8 \u09a8\u09be \u0995\u09b0\u09be \u09aa\u09b0\u09cd\u09af\u09a8\u09cd\u09a4 \u09a8\u09c0\u09b0\u09ac \u09a5\u09be\u0995\u09c7\u0964",
  "faq.q7":
    "\u0985\u09a4\u09bf\u09a5\u09bf \u09b8\u0982\u0996\u09cd\u09af\u09be \u09ac\u09be \u09b2\u09bf\u0999\u09cd\u0995 \u0995\u09a4\u09ac\u09be\u09b0 \u0996\u09cb\u09b2\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7 \u09a4\u09be\u09b0 \u0995\u09cb\u09a8\u09cb \u09b8\u09c0\u09ae\u09be \u0986\u099b\u09c7 \u0995\u09bf?",
  "faq.a7":
    "\u09a8\u09be\u0964 \u0986\u09aa\u09a8\u09bf \u09af\u09a4 \u0996\u09c1\u09b6\u09bf \u0985\u09a4\u09bf\u09a5\u09bf\u09b0 \u09b8\u09be\u09a5\u09c7, \u09af\u09c7\u0995\u09cb\u09a8\u09cb \u09b8\u0982\u0996\u09cd\u09af\u0995 \u0997\u09cd\u09b0\u09c1\u09aa\u09c7 \u0986\u09aa\u09a8\u09be\u09b0 \u09b2\u09bf\u0999\u09cd\u0995 \u09b6\u09c7\u09af\u09bc\u09be\u09b0 \u0995\u09b0\u09c1\u09a8 \u2014 \u0995\u09cb\u09a8\u09cb \u0985\u09a4\u09bf\u09a5\u09bf \u09b8\u09c0\u09ae\u09be \u09a8\u09c7\u0987 \u098f\u09ac\u0982 \u09a6\u09c7\u0996\u09be\u09b0 \u0995\u09cb\u09a8\u09cb \u09b8\u09c0\u09ae\u09be \u09a8\u09c7\u0987\u0964",
  "faq.q8":
    "\u0985\u09a4\u09bf\u09a5\u09bf\u09a6\u09c7\u09b0 \u0995\u09bf \u0995\u09bf\u099b\u09c1 \u0987\u09a8\u09b8\u09cd\u099f\u09b2 \u0995\u09b0\u09a4\u09c7 \u09ac\u09be \u09b8\u09be\u0987\u09a8 \u0986\u09aa \u0995\u09b0\u09a4\u09c7 \u09b9\u09ac\u09c7?",
  "faq.a8":
    "\u09a8\u09be\u0964 \u09b2\u09bf\u0999\u09cd\u0995\u099f\u09bf \u09b8\u09b0\u09be\u09b8\u09b0\u09bf \u09a4\u09be\u09a6\u09c7\u09b0 \u09ab\u09cb\u09a8\u09c7\u09b0 \u09ac\u09cd\u09b0\u09be\u0989\u099c\u09be\u09b0\u09c7 \u0996\u09cb\u09b2\u09c7 \u2014 \u0995\u09cb\u09a8\u09cb \u0985\u09cd\u09af\u09be\u09aa \u09a8\u09c7\u0987, \u0995\u09cb\u09a8\u09cb \u0985\u09cd\u09af\u09be\u0995\u09be\u0989\u09a8\u09cd\u099f \u09a8\u09c7\u0987, \u0987\u09a8\u09b8\u09cd\u099f\u09b2 \u0995\u09b0\u09be\u09b0 \u0995\u09bf\u099b\u09c1 \u09a8\u09c7\u0987\u0964",
  "faq.q9":
    "\u09aa\u09cd\u09b0\u0995\u09be\u09b6\u09c7\u09b0 \u09aa\u09b0\u09c7 \u09af\u09a6\u09bf \u098f\u099f\u09bf \u09a6\u09c7\u0996\u09a4\u09c7 \u0986\u09ae\u09be\u09b0 \u09aa\u099b\u09a8\u09cd\u09a6 \u09a8\u09be \u09b9\u09af\u09bc?",
  "faq.a9":
    "\u0986\u09aa\u09a8\u09bf \u0995\u09cb\u09a8\u09cb \u0985\u09a4\u09bf\u09b0\u09bf\u0995\u09cd\u09a4 \u0996\u09b0\u099a \u099b\u09be\u09a1\u09bc\u09be\u0987 \u09aa\u09cd\u09b0\u0995\u09be\u09b6\u09bf\u09a4 \u0986\u09ae\u09a8\u09cd\u09a4\u09cd\u09b0\u09a3\u09aa\u09a4\u09cd\u09b0 \u09b8\u09ae\u09cd\u09aa\u09be\u09a6\u09a8\u09be \u0995\u09b0\u09a4\u09c7 \u09a5\u09be\u0995\u09a4\u09c7 \u09aa\u09be\u09b0\u09c7\u09a8\u0964 \u09af\u09a6\u09bf \u09b8\u09a4\u09cd\u09af\u09bf\u0987 \u0995\u09bf\u099b\u09c1 \u09ad\u09c7\u0999\u09c7 \u09af\u09be\u09af\u09bc, \u0986\u09ae\u09be\u09a6\u09c7\u09b0 \u09b0\u09bf\u09ab\u09be\u09a8\u09cd\u09a1 \u09a8\u09c0\u09a4\u09bf \u09a6\u09c7\u0996\u09c1\u09a8 \u2014 \u0986\u09ae\u09b0\u09be \u098f\u099f\u09bf \u09a0\u09bf\u0995 \u0995\u09b0\u09ac \u0985\u09a5\u09ac\u09be \u0986\u09aa\u09a8\u09be\u0995\u09c7 \u09ab\u09c7\u09b0\u09a4 \u09a6\u09c7\u09ac\u0964",
  "faq.q10":
    "\u0986\u09ae\u09bf \u0986\u099f\u0995\u09c7 \u0997\u09c7\u09b2\u09c7 \u0995\u09bf \u09b8\u09be\u09b9\u09be\u09af\u09cd\u09af \u09aa\u09c7\u09a4\u09c7 \u09aa\u09be\u09b0\u09bf?",
  "faq.a10":
    "\u09b9\u09cd\u09af\u09be\u0981 \u2014 \u0986\u09ae\u09be\u09a6\u09c7\u09b0 \u09af\u09cb\u0997\u09be\u09af\u09cb\u0997 \u09aa\u09c7\u099c \u09a5\u09c7\u0995\u09c7 \u09af\u09c7\u0995\u09cb\u09a8\u09cb \u09b8\u09ae\u09af\u09bc \u0986\u09ae\u09be\u09a6\u09c7\u09b0 \u09b8\u09be\u09a5\u09c7 \u09af\u09cb\u0997\u09be\u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8 \u098f\u09ac\u0982 \u0986\u09ae\u09b0\u09be \u0986\u09aa\u09a8\u09be\u09b0 \u0986\u09ae\u09a8\u09cd\u09a4\u09cd\u09b0\u09a3\u09aa\u09a4\u09cd\u09b0 \u09aa\u09cd\u09b0\u09b8\u09cd\u09a4\u09c1\u09a4 \u0995\u09b0\u09a4\u09c7 \u09b8\u09be\u09b9\u09be\u09af\u09cd\u09af \u0995\u09b0\u09ac\u0964",
  "closing.shubhVivah": "\u09b6\u09c1\u09ad \u09ac\u09bf\u09ac\u09be\u09b9",
  "closing.heading": "\u098f\u0995\u099f\u09bf",
  "closing.headingEm": "\u09b8\u09c1\u09a8\u09cd\u09a6\u09b0",
  "closing.headingSuffix":
    "\u09b6\u09c1\u09ad\u09c7\u099a\u09cd\u099b\u09be \u09a6\u09bf\u09af\u09bc\u09c7 \u09b6\u09c1\u09b0\u09c1 \u0995\u09b0\u09c1\u09a8\u0964",
  "closing.createYours":
    "\u0986\u09aa\u09a8\u09be\u09b0\u099f\u09bf \u09a4\u09c8\u09b0\u09bf \u0995\u09b0\u09c1\u09a8",
};

const pa: Partial<Dictionary> = {
  "nav.designs": "ਡਿਜ਼ਾਈਨ",
  "nav.howItWorks": "ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ",
  "nav.pricing": "ਕੀਮਤ",
  "nav.faq": "ਅਕਸਰ ਪੁੱਛੇ ਜਾਂਦੇ ਸਵਾਲ",
  "nav.createYours": "ਆਪਣਾ ਬਣਾਓ",
  "nav.signIn": "ਸਾਈਨ ਇਨ ਕਰੋ",
  "nav.dashboard": "ਡੈਸ਼ਬੋਰਡ",
  "nav.signOut": "ਸਾਈਨ ਆਉਟ ਕਰੋ",
  "nav.openMenu": "ਮੀਨੂ ਖੋਲ੍ਹੋ",
  "nav.closeMenu": "ਮੀਨੂ ਬੰਦ ਕਰੋ",
  "nav.primaryLabel": "ਮੁੱਖ",
  "footer.tagline":
    "ਹਰ ਮਹਿਮਾਨ ਦੇ ਫੋਨ ਲਈ ਐਨੀਮੇਟਿਡ ਵਿਆਹ ਦੇ ਸੱਦੇ। ਕੋਈ ਭੌਤਿਕ ਉਤਪਾਦ ਨਹੀਂ ਭੇਜਿਆ ਜਾਂਦਾ।",
  "footer.explore": "ਖੋਜੋ",
  "footer.policies": "ਨੀਤੀਆਂ",
  "footer.terms": "ਸ਼ਰਤਾਂ",
  "footer.privacy": "ਪਰਦੇਦਾਰੀ",
  "footer.refunds": "ਰਿਫੰਡ",
  "footer.contact": "ਸੰਪਰਕ ਕਰੋ",
  "footer.copy": "ਪਿਆਰ ਨਾਲ ਬਣਾਇਆ, ਪਿਆਰ ਲਈ।",
  "hero.eyebrow": "ਡਿਜੀਟਲ ਵਿਆਹ ਦੇ ਸੱਦੇ",
  "hero.titleLine1": "ਇੱਕ ਸੱਦਾ",
  "hero.titleOpenPrefix": "ਜੋ ਉਹ ",
  "hero.titleOpen": "ਦੋ ਵਾਰ ਖੋਲ੍ਹਣਗੇ",
  "hero.titleLine3": "",
  "hero.lede":
    "ਲਿਫ਼ਾਫ਼ੇ ਜੋ ਖੁੱਲ੍ਹਦੇ ਹਨ, ਮਹਿਲ ਦੇ ਦਰਵਾਜ਼ੇ ਜੋ ਵੱਖ ਹੁੰਦੇ ਹਨ, ਸੋਨੇ ਦੀ ਫੁਆਇਲ ਹੇਠਾਂ ਦੱਸੀ ਜਾਂਦੀ ਤਾਰੀਖ। ਤੁਹਾਡੇ ਖਾਸ ਦਿਨ ਲਈ ਤੁਹਾਡਾ ਆਪਣਾ ਨਿੱਜੀ ਵੈੱਬਪੇਜ — ਇੱਕ ਵਟਸਐਪ ਲਿੰਕ ਵਿੱਚ ਸਾਂਝਾ ਕਰੋ।",
  "hero.browseDesigns": "{count} ਡਿਜ਼ਾਈਨ ਵੇਖੋ",
  "hero.noteStrong": "ਅਸੀਮਤ ਕਸਟਮਾਈਜ਼ੇਸ਼ਨ",
  "hero.noteRest": "ਹਮੇਸ਼ਾ ਮੁਫ਼ਤ",
  "theme.preview": "ਝਲਕ",
  "theme.useDesign": "ਇਹ ਡਿਜ਼ਾਈਨ ਵਰਤੋ",
  "editor.design": "ਡਿਜ਼ਾਈਨ",
  "editor.yourNames": "ਤੁਹਾਡੇ ਨਾਂ",
  "editor.name": "ਨਾਮ",
  "editor.partnersName": "ਸਾਥੀ ਦਾ ਨਾਮ",
  "editor.families": "ਪਰਿਵਾਰ",
  "editor.familiesNote":
    "ਭਾਰਤੀ ਸੱਦਿਆਂ ਵਿੱਚ ਮਾਪਿਆਂ ਦੇ ਨਾਮ ਦਿੱਤੇ ਜਾਂਦੇ ਹਨ; ਛੱਡਣਾ ਹੋਵੇ ਤਾਂ ਖਾਲੀ ਰੱਖੋ।",
  "editor.firstSide": "ਪਹਿਲਾ ਪੱਖ",
  "editor.secondSide": "ਦੂਜਾ ਪੱਖ",
  "editor.parents": "ਮਾਪੇ",
  "editor.grandparents": "ਦਾਦਾ-ਦਾਦੀ/ਨਾਨਾ-ਨਾਨੀ",
  "editor.qualifications": "ਯੋਗਤਾਵਾਂ",
  "editor.openingText": "ਸ਼ੁਰੂਆਤੀ ਲਿਖਤ",
  "editor.openingTextHint":
    "ਵਿਕਲਪਿਕ — ਜ਼ਿਆਦਾਤਰ ਸੱਦੇ ਮੁੱਖ ਤਸਵੀਰ ਤੋਂ ਸਿੱਧੇ ਨਾਵਾਂ ਵੱਲ ਜਾਂਦੇ ਹਨ, ਜੋ ਸਭ ਤੋਂ ਸਾਫ਼ ਲੱਗਦਾ ਹੈ। ਨਾਵਾਂ ਦੇ ਉੱਪਰ ਇੱਕ ਲਾਈਨ ਚਾਹੀਦੀ ਹੋਵੇ ਤਾਂ ਹੀ ਇਹ ਭਰੋ।",
  "editor.welcomeLine": "ਸਵਾਗਤੀ ਲਾਈਨ",
  "editor.blessingOrVerse": "ਅਸੀਸ ਜਾਂ ਕਵਿਤਾ",
  "editor.attribution": "ਸਿਹਰਾ",
  "editor.theDay": "ਦਿਨ",
  "editor.occasion": "ਮੌਕਾ",
  "editor.dateAndTime": "ਤਾਰੀਖ ਅਤੇ ਸਮਾਂ",
  "editor.venue": "ਸਥਾਨ",
  "editor.googleMapsLink": "ਗੂਗਲ ਮੈਪਸ ਲਿੰਕ",
  "editor.mapsHint":
    "ਵਿਕਲਪਿਕ — ਖਾਲੀ ਰੱਖੋ ਅਤੇ ਸਥਾਨ ਦੇ ਨਾਮ 'ਤੇ ਟੈਪ ਕਰਨ ਨਾਲ ਆਪਣੇ ਆਪ ਗੂਗਲ ਮੈਪਸ 'ਤੇ ਖੋਜ ਹੋਵੇਗੀ। ਮਹਿਮਾਨਾਂ ਨੂੰ ਕਿਸੇ ਖਾਸ ਪਿੰਨ 'ਤੇ ਭੇਜਣਾ ਹੋਵੇ ਤਾਂ ਹੀ ਇੱਥੇ ਲਿੰਕ ਪਾਓ।",
  "editor.yourFunctions": "ਤੁਹਾਡੇ ਸਮਾਗਮ",
  "editor.addFunction": "ਸਮਾਗਮ ਜੋੜੋ",
  "editor.replies": "ਜਵਾਬ",
  "editor.whatsappNumber": "ਵਟਸਐਪ ਨੰਬਰ",
  "editor.replyBy": "ਇਸ ਤਾਰੀਖ ਤੱਕ ਜਵਾਬ ਦਿਓ",
  "editor.yourHashtag": "ਤੁਹਾਡਾ ਹੈਸ਼ਟੈਗ",
  "editor.travelStay": "ਯਾਤਰਾ ਅਤੇ ਠਹਿਰਾਅ",
  "editor.gettingThere": "ਉੱਥੇ ਕਿਵੇਂ ਪਹੁੰਚਣਾ ਹੈ",
  "editor.whereToStay": "ਕਿੱਥੇ ਠਹਿਰਨਾ ਹੈ",
  "editor.goodToKnow": "ਜਾਣਨਾ ਜ਼ਰੂਰੀ",
  "editor.music": "ਸੰਗੀਤ",
  "editor.photos": "ਤਸਵੀਰਾਂ",
  "editor.yourStory": "ਤੁਹਾਡੀ ਕਹਾਣੀ",
  "editor.lineForGuests": "ਮਹਿਮਾਨਾਂ ਲਈ ਇੱਕ ਲਾਈਨ",
  "editor.togetherSince": "ਕਦੋਂ ਤੋਂ ਇਕੱਠੇ ਹੋ",
  "editor.replayOpening": "ਸ਼ੁਰੂਆਤ ਮੁੜ ਵੇਖੋ",
  "editor.previewNote":
    "ਇਹ ਇੱਕ ਲਾਈਵ ਝਲਕ ਹੈ — ਖੱਬੇ ਪਾਸੇ ਕੀਤੀ ਹਰ ਤਬਦੀਲੀ ਇੱਥੇ ਤੁਰੰਤ ਦਿਖਦੀ ਹੈ। ਕੋਈ ਖੇਤਰ ਖਾਲੀ ਛੱਡੋ ਤਾਂ ਇਹ ਤੁਹਾਡੇ ਸੱਦੇ ਵਿੱਚੋਂ ਬਿਲਕੁਲ ਛੱਡ ਦਿੱਤਾ ਜਾਂਦਾ ਹੈ; ਕਦੇ ਵੀ ਖਾਲੀ ਲਾਈਨ ਜਾਂ ਪਲੇਸਹੋਲਡਰ ਟੈਕਸਟ ਨਹੀਂ ਦਿਖਦਾ। ਨਮੂਨਾ ਤਸਵੀਰਾਂ ਇਸ ਝਲਕ ਵਿੱਚ ਸਿਰਫ਼ ਖਾਲੀ ਤਸਵੀਰ ਥਾਵਾਂ ਵਿੱਚ ਦਿਖਾਈ ਦੇ ਸਕਦੀਆਂ ਹਨ — ਮਹਿਮਾਨ ਉਹ ਥਾਵਾਂ ਖਾਲੀ ਵੇਖਦੇ ਹਨ ਜਦ ਤੱਕ ਤੁਸੀਂ ਆਪਣੀਆਂ ਤਸਵੀਰਾਂ ਨਹੀਂ ਜੋੜਦੇ।",
  "collection.eyebrow": "\u0a38\u0a70\u0a17\u0a4d\u0a30\u0a39\u0a3f",
  "collection.heading":
    "{count} \u0a24\u0a30\u0a40\u0a15\u0a47 \u0a15\u0a39\u0a3f\u0a23 \u0a26\u0a47",
  "collection.headingEm": "\u0a38\u0a47\u0a35 \u0a26 \u0a21\u0a47\u0a1f",
  "collection.sub":
    "\u0a39\u0a30 \u0a21\u0a3f\u0a1c\u0a3c\u0a3e\u0a08\u0a28 \u0a2a\u0a39\u0a3f\u0a32\u0a40 \u0a1f\u0a48\u0a2a \u0a24\u0a4b\u0a02 \u0a32\u0a48 \u0a15\u0a47 \u0a05\u0a70\u0a24\u0a3f\u0a2e \u0a15\u0a3e\u0a0a\u0a02\u0a1f\u0a21\u0a3e\u0a0a\u0a28 \u0a24\u0a71\u0a15 \u0a07\u0a71\u0a15 \u0a2a\u0a42\u0a30\u0a3e \u0a10\u0a28\u0a40\u0a2e\u0a47\u0a1f\u0a21 \u0a24\u0a1c\u0a30\u0a2c\u0a3e \u0a39\u0a48\u0964",
  "collection.seeAll":
    "\u0a38\u0a3e\u0a30\u0a47 {count} \u0a21\u0a3f\u0a1c\u0a3c\u0a3e\u0a08\u0a28 \u0a35\u0a47\u0a16\u0a4b",
  "how.eyebrow":
    "\u0a07\u0a39 \u0a15\u0a3f\u0a35\u0a47\u0a02 \u0a15\u0a70\u0a2e \u0a15\u0a30\u0a26\u0a3e \u0a39\u0a48",
  "how.heading": "\u0a07\u0a71\u0a15 \u0a38\u0a3c\u0a3e\u0a2e \u0a35\u0a3f\u0a71\u0a1a",
  "how.headingEm": "\u0a24\u0a3f\u0a06\u0a30",
  "steps.1.title":
    "\u0a07\u0a71\u0a15 \u0a21\u0a3f\u0a1c\u0a3c\u0a3e\u0a08\u0a28 \u0a1a\u0a41\u0a23\u0a4b",
  "steps.1.body":
    "{count} \u0a10\u0a28\u0a40\u0a2e\u0a47\u0a1f\u0a21 \u0a38\u0a71\u0a26\u0a47 \u0a2c\u0a4d\u0a30\u0a3e\u0a0a\u0a1c\u0a3c \u0a15\u0a30\u0a4b \u2014 \u0a38\u0a3c\u0a3e\u0a39\u0a40, \u0a06\u0a27\u0a41\u0a28\u0a3f\u0a15, \u0a2b\u0a41\u0a71\u0a32\u0a3e\u0a02 \u0a35\u0a3e\u0a32\u0a47, \u0a2e\u0a70\u0a1c\u0a3c\u0a3f\u0a32\u0964 \u0a39\u0a30 \u0a07\u0a71\u0a15 \u0a28\u0a42\u0a70 \u0a2c\u0a3f\u0a32\u0a15\u0a41\u0a32 \u0a09\u0a35\u0a47\u0a02 \u0a39\u0a40 \u0a35\u0a47\u0a16\u0a4b \u0a1c\u0a3f\u0a35\u0a47\u0a02 \u0a24\u0a41\u0a39\u0a3e\u0a21\u0a47 \u0a2e\u0a39\u0a3f\u0a2e\u0a3e\u0a28 \u0a35\u0a47\u0a16\u0a23\u0a17\u0a47\u0964",
  "steps.2.title":
    "\u0a2e\u0a41\u0a2b\u0a3c\u0a24 \u0a35\u0a3f\u0a71\u0a1a \u0a15\u0a38\u0a1f\u0a2e\u0a3e\u0a08\u0a1c\u0a3c \u0a15\u0a30\u0a4b",
  "steps.2.body":
    "\u0a06\u0a2a\u0a23\u0a47 \u0a28\u0a3e\u0a2e, \u0a24\u0a3e\u0a30\u0a40\u0a16\u0a3e\u0a02, \u0a25\u0a3e\u0a35\u0a3e\u0a02, \u0a39\u0a32\u0a26\u0a40 \u0a24\u0a4b\u0a02 \u0a30\u0a3f\u0a38\u0a48\u0a2a\u0a38\u0a3c\u0a28 \u0a24\u0a71\u0a15 \u0a39\u0a30 \u0a38\u0a2e\u0a3e\u0a17\u0a2e, \u0a06\u0a2a\u0a23\u0a40\u0a06\u0a02 \u0a24\u0a38\u0a35\u0a40\u0a30\u0a3e\u0a02 \u0a05\u0a24\u0a47 \u0a38\u0a70\u0a17\u0a40\u0a24 \u0a38\u0a3c\u0a3e\u0a2e\u0a32 \u0a15\u0a30\u0a4b\u0964 \u0a1c\u0a3f\u0a70\u0a28\u0a40 \u0a35\u0a3e\u0a30 \u0a1a\u0a3e\u0a39\u0a4b \u0a2c\u0a26\u0a32\u0a4b\u0964",
  "steps.3.title":
    "\u0a07\u0a71\u0a15 \u0a35\u0a3e\u0a30 \u0a2d\u0a41\u0a17\u0a24\u0a3e\u0a28 \u0a15\u0a30\u0a4b, \u0a38\u0a3e\u0a02\u0a1d\u0a3e \u0a15\u0a30\u0a4b",
  "steps.3.body":
    "\u20b9599 \u0a35\u0a3f\u0a71\u0a1a \u0a2a\u0a4d\u0a30\u0a15\u0a3e\u0a38\u0a3c\u0a3f\u0a24 \u0a15\u0a30\u0a4b \u0a05\u0a24\u0a47 \u0a06\u0a2a\u0a23\u0a3e \u0a16\u0a41\u0a26 \u0a26\u0a3e \u0a32\u0a3f\u0a70\u0a15 \u0a2a\u0a3e\u0a13\u0964 \u0a07\u0a38\u0a28\u0a42\u0a70 \u0a35\u0a1f\u0a38\u0a10\u0a2a, \u0a07\u0a70\u0a38\u0a1f\u0a3e\u0a17\u0a4d\u0a30\u0a3e\u0a2e, \u0a15\u0a3f\u0a24\u0a47 \u0a35\u0a40 \u0a2d\u0a47\u0a1c\u0a4b \u2014 \u0a07\u0a39 \u0a15\u0a3f\u0a38\u0a47 \u0a35\u0a40 \u0a2b\u0a3c\u0a4b\u0a28 '\u0a24\u0a47 \u0a16\u0a42\u0a2c\u0a38\u0a42\u0a30\u0a24\u0a40 \u0a28\u0a3e\u0a32 \u0a16\u0a41\u0a71\u0a32\u0a4d\u0a39\u0a26\u0a3e \u0a39\u0a48\u0964",
  "compare.eyebrow":
    "\u0a21\u0a3f\u0a1c\u0a40\u0a1f\u0a32 \u0a15\u0a3f\u0a09\u0a02 \u0a1a\u0a41\u0a23\u0a40\u0a0f",
  "compare.heading": "\u0a15\u0a3e\u0a17\u0a1c\u0a3c",
  "compare.headingEm": "\u0a2c\u0a28\u0a3e\u0a2e",
  "compare.headingSuffix": "\u0a21\u0a3f\u0a1c\u0a40\u0a1f\u0a32",
  "compare.colFeature": "\u0a35\u0a3f\u0a38\u0a3c\u0a47\u0a38\u0a3c\u0a24\u0a3e",
  "compare.colPaper": "\u0a15\u0a3e\u0a17\u0a1c\u0a3c",
  "compare.colDigital": "\u0a21\u0a3f\u0a1c\u0a40\u0a1f\u0a32",
  "compare.row.cost.feature": "\u0a32\u0a3e\u0a17\u0a24",
  "compare.row.cost.paper":
    "\u20b9150\u2013\u20b9500+ \u0a2a\u0a4d\u0a30\u0a24\u0a40 \u0a15\u0a3e\u0a30\u0a21, \u0a28\u0a3e\u0a32 \u0a1b\u0a2a\u0a3e\u0a08",
  "compare.row.cost.digital": "\u20b9599 \u0a07\u0a71\u0a15 \u0a35\u0a3e\u0a30",
  "compare.row.delivery.feature":
    "\u0a21\u0a3f\u0a32\u0a40\u0a35\u0a30\u0a40 \u0a26\u0a3e \u0a38\u0a2e\u0a3e\u0a02",
  "compare.row.delivery.paper":
    "\u0a1b\u0a2a\u0a3e\u0a08 \u0a05\u0a24\u0a47 \u0a15\u0a4b\u0a30\u0a40\u0a05\u0a30 \u0a32\u0a08 1\u20132 \u0a39\u0a2b\u0a3c\u0a24\u0a47",
  "compare.row.delivery.digital": "\u0a24\u0a41\u0a30\u0a70\u0a24",
  "compare.row.animation.feature":
    "\u0a13\u0a2a\u0a28\u0a3f\u0a70\u0a17 \u0a10\u0a28\u0a40\u0a2e\u0a47\u0a38\u0a3c\u0a28",
  "compare.row.music.feature":
    "\u0a2c\u0a48\u0a15\u0a17\u0a4d\u0a30\u0a3e\u0a0a\u0a02\u0a21 \u0a38\u0a70\u0a17\u0a40\u0a24",
  "compare.row.countdown.feature":
    "\u0a32\u0a3e\u0a08\u0a35 \u0a15\u0a3e\u0a0a\u0a02\u0a1f\u0a21\u0a3e\u0a0a\u0a28",
  "compare.row.editable.feature":
    "\u0a2d\u0a47\u0a1c\u0a23 \u0a24\u0a4b\u0a02 \u0a2c\u0a3e\u0a05\u0a26 \u0a35\u0a40 \u0a38\u0a70\u0a2a\u0a3e\u0a26\u0a28\u0a2f\u0a4b\u0a17",
  "compare.row.maps.feature":
    "\u0a17\u0a42\u0a17\u0a32 \u0a2e\u0a48\u0a2a\u0a38 \u0a26\u0a3f\u0a38\u0a3c\u0a3e-\u0a28\u0a3f\u0a30\u0a26\u0a47\u0a38\u0a3c",
  "compare.row.guests.feature":
    "\u0a05\u0a38\u0a40\u0a2e\u0a3f\u0a24 \u0a2e\u0a39\u0a3f\u0a2e\u0a3e\u0a28 \u0a05\u0a24\u0a47 \u0a38\u0a3c\u0a47\u0a05\u0a30",
  "compare.row.whatsapp.feature":
    "\u0a35\u0a1f\u0a38\u0a10\u0a2a '\u0a24\u0a47 \u0a38\u0a3e\u0a02\u0a1d\u0a3e \u0a15\u0a30\u0a28\u0a2f\u0a4b\u0a17",
  "pricing.eyebrow": "\u0a15\u0a40\u0a2e\u0a24",
  "pricing.heading1": "\u0a07\u0a71\u0a15 \u0a15\u0a40\u0a2e\u0a24\u0964",
  "pricing.heading2":
    "\u0a15\u0a4b\u0a08 \u0a2e\u0a48\u0a02\u0a2c\u0a30\u0a38\u0a3c\u0a3f\u0a2a \u0a28\u0a39\u0a40\u0a02\u0964",
  "pricing.body":
    "\u0a2c\u0a3f\u0a28\u0a3e\u0a02 \u0a15\u0a3f\u0a38\u0a47 \u0a32\u0a3e\u0a17\u0a24 \u0a26\u0a47 \u0a1c\u0a3f\u0a70\u0a28\u0a3e \u0a1a\u0a3f\u0a30 \u0a1a\u0a3e\u0a39\u0a4b \u0a21\u0a3f\u0a1c\u0a3c\u0a3e\u0a08\u0a28 \u0a05\u0a24\u0a47 \u0a1d\u0a32\u0a15 \u0a35\u0a47\u0a16\u0a4b\u0964 \u0a26\u0a41\u0a28\u0a40\u0a06 \u0a28\u0a3e\u0a32 \u0a38\u0a3e\u0a02\u0a1d\u0a3e \u0a15\u0a30\u0a28 \u0a32\u0a08 \u0a24\u0a3f\u0a06\u0a30 \u0a39\u0a4b\u0a35\u0a4b \u0a24\u0a3e\u0a02 \u0a39\u0a40 \u0a2d\u0a41\u0a17\u0a24\u0a3e\u0a28 \u0a15\u0a30\u0a4b\u0964",
  "pricing.theInvitation": "\u0a38\u0a71\u0a26\u0a3e",
  "pricing.oneTime": "\u0a07\u0a71\u0a15 \u0a35\u0a3e\u0a30",
  "pricing.startCustomising":
    "\u0a2e\u0a41\u0a2b\u0a3c\u0a24 \u0a35\u0a3f\u0a71\u0a1a \u0a15\u0a38\u0a1f\u0a2e\u0a3e\u0a08\u0a1c\u0a3c \u0a15\u0a30\u0a28\u0a3e \u0a38\u0a3c\u0a41\u0a30\u0a42 \u0a15\u0a30\u0a4b",
  "included.0":
    "\u0a38\u0a3e\u0a21\u0a47 {count} \u0a10\u0a28\u0a40\u0a2e\u0a47\u0a1f\u0a21 \u0a21\u0a3f\u0a1c\u0a3c\u0a3e\u0a08\u0a28\u0a3e\u0a02 \u0a35\u0a3f\u0a71\u0a1a\u0a4b\u0a02 \u0a15\u0a4b\u0a08 \u0a35\u0a40",
  "included.1":
    "\u0a05\u0a38\u0a40\u0a2e\u0a3f\u0a24 \u0a38\u0a2e\u0a3e\u0a17\u0a2e \u2014 \u0a39\u0a32\u0a26\u0a40 \u0a24\u0a4b\u0a02 \u0a30\u0a3f\u0a38\u0a48\u0a2a\u0a38\u0a3c\u0a28 \u0a24\u0a71\u0a15",
  "included.2":
    "\u0a2b\u0a4b\u0a1f\u0a4b \u0a17\u0a48\u0a32\u0a30\u0a40, \u0a38\u0a70\u0a17\u0a40\u0a24 \u0a05\u0a24\u0a47 \u0a32\u0a3e\u0a08\u0a35 \u0a15\u0a3e\u0a0a\u0a02\u0a1f\u0a21\u0a3e\u0a0a\u0a28",
  "included.3":
    "\u0a39\u0a30 \u0a25\u0a3e\u0a02 \u0a32\u0a08 \u0a17\u0a42\u0a17\u0a32 \u0a2e\u0a48\u0a2a\u0a38 \u0a26\u0a3f\u0a38\u0a3c\u0a3e-\u0a28\u0a3f\u0a30\u0a26\u0a47\u0a38\u0a3c",
  "included.4":
    "\u0a05\u0a38\u0a40\u0a2e\u0a3f\u0a24 \u0a2e\u0a39\u0a3f\u0a2e\u0a3e\u0a28, \u0a05\u0a38\u0a40\u0a2e\u0a3f\u0a24 \u0a38\u0a3c\u0a47\u0a05\u0a30",
  "included.5":
    "\u0a2a\u0a4d\u0a30\u0a15\u0a3e\u0a38\u0a3c\u0a3f\u0a24 \u0a15\u0a30\u0a28 \u0a24\u0a4b\u0a02 \u0a2c\u0a3e\u0a05\u0a26 \u0a15\u0a3f\u0a38\u0a47 \u0a35\u0a40 \u0a38\u0a2e\u0a47\u0a02 \u0a35\u0a47\u0a30\u0a35\u0a47 \u0a2c\u0a26\u0a32\u0a4b",
  "faq.eyebrow": "\u0a38\u0a35\u0a3e\u0a32",
  "faq.heading": "\u0a38\u0a3c\u0a41\u0a30\u0a42 \u0a15\u0a30\u0a28 \u0a24\u0a4b\u0a02",
  "faq.headingEm": "\u0a2a\u0a39\u0a3f\u0a32\u0a3e\u0a02",
  "faq.q0":
    "\u0a15\u0a40 \u0a21\u0a3f\u0a1c\u0a3c\u0a3e\u0a08\u0a28 \u0a15\u0a30\u0a28\u0a3e \u0a38\u0a71\u0a1a\u0a2e\u0a41\u0a71\u0a1a \u0a2e\u0a41\u0a2b\u0a3c\u0a24 \u0a39\u0a48?",
  "faq.a0":
    "ਹਾਂ। ਕੋਈ ਵੀ ਡਿਜ਼ਾਈਨ ਚੁਣੋ, ਆਪਣੇ ਨਾਮ, ਤਾਰੀਖਾਂ ਅਤੇ ਥਾਵਾਂ ਜੋੜੋ, ਅਤੇ ਪੂਰੀ ਚੀਜ਼ ਨੂੰ ਆਪਣੇ ਫ਼ੋਨ 'ਤੇ ਵੇਖੋ — ਸਭ ਮੁਫ਼ਤ। ਆਪਣੀਆਂ ਤਸਵੀਰਾਂ ਜਾਂ ਸੰਗੀਤ ਜੋੜਨ ਲਈ ਸਿਰਫ਼ ਇੱਕ ਮੁਫ਼ਤ ਖਾਤਾ ਚਾਹੀਦਾ ਹੈ। ਤੁਸੀਂ ਸਿਰਫ਼ ਪ੍ਰਕਾਸ਼ਿਤ ਕਰਨ ਵੇਲੇ ਭੁਗਤਾਨ ਕਰਦੇ ਹੋ।",
  "faq.q1":
    "\u20b9599 \u0a05\u0a38\u0a32 \u0a35\u0a3f\u0a71\u0a1a \u0a15\u0a3f\u0a38 \u0a32\u0a08 \u0a39\u0a48?",
  "faq.a1":
    "\u0a07\u0a71\u0a15 \u0a38\u0a71\u0a26\u0a3e, \u0a07\u0a71\u0a15 \u0a35\u0a3e\u0a30 \u0a2a\u0a4d\u0a30\u0a15\u0a3e\u0a38\u0a3c\u0a3f\u0a24, \u0a06\u0a2a\u0a23\u0a47 \u0a16\u0a41\u0a26 \u0a26\u0a47 \u0a38\u0a3e\u0a02\u0a1d\u0a47 \u0a15\u0a30\u0a28\u0a2f\u0a4b\u0a17 \u0a32\u0a3f\u0a70\u0a15 \u0a28\u0a3e\u0a32 \u2014 \u0a15\u0a4b\u0a08 \u0a35\u0a3e\u0a1f\u0a30\u0a2e\u0a3e\u0a30\u0a15 \u0a28\u0a39\u0a40\u0a02, \u0a15\u0a4b\u0a08 \u0a2e\u0a48\u0a02\u0a2c\u0a30\u0a38\u0a3c\u0a3f\u0a2a \u0a28\u0a39\u0a40\u0a02, \u0a2a\u0a4d\u0a30\u0a24\u0a40-\u0a2e\u0a39\u0a3f\u0a2e\u0a3e\u0a28 \u0a16\u0a30\u0a1a\u0a3e \u0a28\u0a39\u0a40\u0a02\u0964 \u0a24\u0a41\u0a38\u0a40\u0a02 \u0a35\u0a3f\u0a06\u0a39 \u0a24\u0a71\u0a15 \u0a2a\u0a4d\u0a30\u0a15\u0a3e\u0a38\u0a3c\u0a3f\u0a24 \u0a15\u0a30\u0a28 \u0a24\u0a4b\u0a02 \u0a2c\u0a3e\u0a05\u0a26 \u0a35\u0a40 \u0a07\u0a38\u0a28\u0a42\u0a70 \u0a38\u0a70\u0a2a\u0a3e\u0a26\u0a3f\u0a24 \u0a15\u0a30\u0a26\u0a47 \u0a30\u0a39\u0a3f \u0a38\u0a15\u0a26\u0a47 \u0a39\u0a4b\u0964",
  "faq.q2":
    "\u0a15\u0a40 \u0a2e\u0a48\u0a02 \u0a39\u0a32\u0a26\u0a40, \u0a38\u0a70\u0a17\u0a40\u0a24 \u0a05\u0a24\u0a47 \u0a30\u0a3f\u0a38\u0a48\u0a2a\u0a38\u0a3c\u0a28 \u0a35\u0a71\u0a16\u0a30\u0a47 \u0a24\u0a4c\u0a30 '\u0a24\u0a47 \u0a38\u0a3c\u0a3e\u0a2e\u0a32 \u0a15\u0a30 \u0a38\u0a15\u0a26\u0a3e/\u0a38\u0a15\u0a26\u0a40 \u0a39\u0a3e\u0a02?",
  "faq.a2":
    "\u0a39\u0a3e\u0a02 \u2014 \u0a1c\u0a3f\u0a70\u0a28\u0a47 \u0a1a\u0a3e\u0a39\u0a4b \u0a38\u0a2e\u0a3e\u0a17\u0a2e \u0a38\u0a3c\u0a3e\u0a2e\u0a32 \u0a15\u0a30\u0a4b, \u0a39\u0a30 \u0a07\u0a71\u0a15 \u0a26\u0a40 \u0a06\u0a2a\u0a23\u0a40 \u0a24\u0a3e\u0a30\u0a40\u0a16, \u0a38\u0a2e\u0a3e\u0a02, \u0a25\u0a3e\u0a02 \u0a05\u0a24\u0a47 \u0a21\u0a30\u0a48\u0a38 \u0a15\u0a4b\u0a21 \u0a28\u0a3e\u0a32, \u0a38\u0a2d \u0a07\u0a71\u0a15 \u0a39\u0a40 \u0a38\u0a71\u0a26\u0a3e \u0a32\u0a3f\u0a70\u0a15 \u0a35\u0a3f\u0a71\u0a1a\u0964",
  "faq.q3":
    "\u0a15\u0a40 \u0a07\u0a39 \u0a09\u0a28\u0a4d\u0a39\u0a3e\u0a02 \u0a2e\u0a39\u0a3f\u0a2e\u0a3e\u0a28\u0a3e\u0a02 \u0a32\u0a08 \u0a15\u0a70\u0a2e \u0a15\u0a30\u0a47\u0a17\u0a3e \u0a1c\u0a4b \u0a35\u0a1f\u0a38\u0a10\u0a2a '\u0a24\u0a47 \u0a28\u0a39\u0a40\u0a02 \u0a39\u0a28?",
  "faq.a3":
    "\u0a32\u0a3f\u0a70\u0a15 \u0a07\u0a71\u0a15 \u0a06\u0a2e \u0a35\u0a48\u0a71\u0a2c \u0a2a\u0a47\u0a1c \u0a39\u0a48, \u0a07\u0a38 \u0a32\u0a08 \u0a07\u0a39 \u0a10\u0a38\u0a10\u0a2e\u0a10\u0a38, \u0a07\u0a70\u0a38\u0a1f\u0a3e\u0a17\u0a4d\u0a30\u0a3e\u0a2e, \u0a08\u0a2e\u0a47\u0a32 \u0a1c\u0a3e\u0a02 \u0a15\u0a3f\u0a38\u0a47 \u0a39\u0a4b\u0a30 \u0a10\u0a2a '\u0a24\u0a47 \u0a35\u0a40 \u0a09\u0a38\u0a47 \u0a24\u0a30\u0a4d\u0a39\u0a3e\u0a02 \u0a16\u0a41\u0a71\u0a32\u0a4d\u0a39\u0a26\u0a3e \u0a39\u0a48 \u2014 \u0a35\u0a1f\u0a38\u0a10\u0a2a \u0a2d\u0a47\u0a1c\u0a23 \u0a26\u0a3e \u0a38\u0a3f\u0a30\u0a2b\u0a3c \u0a38\u0a2d \u0a24\u0a4b\u0a02 \u0a06\u0a38\u0a3e\u0a28 \u0a24\u0a30\u0a40\u0a15\u0a3e \u0a39\u0a48\u0964",
  "faq.q4":
    "\u0a32\u0a3f\u0a70\u0a15 \u0a38\u0a3e\u0a02\u0a1d\u0a3e \u0a15\u0a30\u0a28 \u0a24\u0a4b\u0a02 \u0a2c\u0a3e\u0a05\u0a26 \u0a15\u0a40 \u0a2e\u0a48\u0a02 \u0a35\u0a47\u0a30\u0a35\u0a47 \u0a2c\u0a26\u0a32 \u0a38\u0a15\u0a26\u0a3e/\u0a38\u0a15\u0a26\u0a40 \u0a39\u0a3e\u0a02?",
  "faq.a4":
    "\u0a39\u0a3e\u0a02\u0964 \u0a06\u0a2a\u0a23\u0a47 \u0a38\u0a2e\u0a3e\u0a17\u0a2e \u0a24\u0a4b\u0a02 \u0a2a\u0a39\u0a3f\u0a32\u0a3e\u0a02 \u0a15\u0a3f\u0a38\u0a47 \u0a35\u0a40 \u0a38\u0a2e\u0a47\u0a02 \u0a28\u0a3e\u0a2e, \u0a24\u0a3e\u0a30\u0a40\u0a16\u0a3e\u0a02, \u0a25\u0a3e\u0a35\u0a3e\u0a02 \u0a1c\u0a3e\u0a02 \u0a24\u0a38\u0a35\u0a40\u0a30\u0a3e\u0a02 \u0a2c\u0a26\u0a32\u0a4b \u2014 \u0a32\u0a3f\u0a70\u0a15 \u0a09\u0a39\u0a40 \u0a30\u0a39\u0a3f\u0a70\u0a26\u0a3e \u0a39\u0a48, \u0a07\u0a38 \u0a32\u0a08 \u0a2e\u0a39\u0a3f\u0a2e\u0a3e\u0a28\u0a3e\u0a02 \u0a28\u0a42\u0a70 \u0a39\u0a2e\u0a47\u0a38\u0a3c\u0a3e \u0a28\u0a35\u0a40\u0a28\u0a24\u0a2e \u0a38\u0a70\u0a38\u0a15\u0a30\u0a23 \u0a26\u0a3f\u0a16\u0a3e\u0a08 \u0a26\u0a3f\u0a70\u0a26\u0a3e \u0a39\u0a48\u0964",
  "faq.q5": "\u20b9599 \u0a15\u0a3f\u0a09\u0a02?",
  "faq.a5":
    "\u0a07\u0a39 \u0a24\u0a41\u0a39\u0a3e\u0a21\u0a47 \u0a38\u0a71\u0a26\u0a47 \u0a26\u0a40 \u0a2e\u0a47\u0a1c\u0a3c\u0a2c\u0a3e\u0a28\u0a40 \u0a05\u0a24\u0a47 \u0a2d\u0a41\u0a17\u0a24\u0a3e\u0a28 \u0a1a\u0a32\u0a3e\u0a09\u0a23 \u0a26\u0a40 \u0a32\u0a3e\u0a17\u0a24 \u0a28\u0a42\u0a70 \u0a2a\u0a42\u0a30\u0a3e \u0a15\u0a30\u0a26\u0a3e \u0a39\u0a48 \u2014 \u0a38\u0a30\u0a35\u0a30 \u0a05\u0a24\u0a47 \u0a2d\u0a41\u0a17\u0a24\u0a3e\u0a28 \u0a17\u0a47\u0a1f\u0a35\u0a47 \u0a26\u0a4b\u0a35\u0a47\u0a02 \u0a2a\u0a4d\u0a30\u0a24\u0a40 \u0a38\u0a71\u0a26\u0a47 \u0a16\u0a30\u0a1a\u0a3e \u0a32\u0a48\u0a02\u0a26\u0a47 \u0a39\u0a28\u0964 \u0a05\u0a38\u0a40\u0a02 \u0a07\u0a38 \u0a24\u0a4b\u0a02 \u0a35\u0a71\u0a27 \u0a2e\u0a41\u0a28\u0a3e\u0a2b\u0a3c\u0a3e \u0a15\u0a2e\u0a3e\u0a09\u0a23 \u0a26\u0a40 \u0a15\u0a4b\u0a38\u0a3c\u0a3f\u0a38\u0a3c \u0a28\u0a39\u0a40\u0a02 \u0a15\u0a30 \u0a30\u0a39\u0a47; \u0a05\u0a38\u0a40\u0a02 \u0a1a\u0a3e\u0a39\u0a41\u0a70\u0a26\u0a47 \u0a39\u0a3e\u0a02 \u0a15\u0a3f \u0a24\u0a41\u0a39\u0a3e\u0a21\u0a47 \u0a15\u0a4b\u0a32 \u0a07\u0a71\u0a15 \u0a2e\u0a39\u0a40\u0a28\u0a47 \u0a35\u0a3f\u0a71\u0a1a \u0a17\u0a3e\u0a07\u0a2c \u0a39\u0a4b\u0a23 \u0a35\u0a3e\u0a32\u0a47 \u0a2e\u0a41\u0a2b\u0a3c\u0a24 \u0a38\u0a71\u0a26\u0a47 \u0a26\u0a40 \u0a2c\u0a1c\u0a3e\u0a0f \u0a07\u0a71\u0a15 \u0a16\u0a42\u0a2c\u0a38\u0a42\u0a30\u0a24 \u0a38\u0a71\u0a26\u0a3e \u0a39\u0a4b\u0a35\u0a47\u0964",
  "faq.q6":
    "\u0a15\u0a40 \u0a2e\u0a48\u0a02 \u0a06\u0a2a\u0a23\u0a40\u0a06\u0a02 \u0a24\u0a38\u0a35\u0a40\u0a30\u0a3e\u0a02 \u0a05\u0a24\u0a47 \u0a38\u0a70\u0a17\u0a40\u0a24 \u0a35\u0a30\u0a24 \u0a38\u0a15\u0a26\u0a3e/\u0a38\u0a15\u0a26\u0a40 \u0a39\u0a3e\u0a02?",
  "faq.a6":
    "\u0a39\u0a3e\u0a02\u0964 \u0a17\u0a48\u0a32\u0a30\u0a40 \u0a32\u0a08 \u0a06\u0a2a\u0a23\u0a40\u0a06\u0a02 \u0a24\u0a38\u0a35\u0a40\u0a30\u0a3e\u0a02 \u0a05\u0a71\u0a2a\u0a32\u0a4b\u0a21 \u0a15\u0a30\u0a4b, \u0a05\u0a24\u0a47 \u0a38\u0a3e\u0a21\u0a40 \u0a32\u0a3e\u0a07\u0a2c\u0a4d\u0a30\u0a47\u0a30\u0a40 \u0a35\u0a3f\u0a71\u0a1a\u0a4b\u0a02 \u0a07\u0a71\u0a15 \u0a17\u0a40\u0a24 \u0a1a\u0a41\u0a23\u0a4b \u0a1c\u0a3e\u0a02 \u0a06\u0a2a\u0a23\u0a3e \u0a17\u0a40\u0a24 \u0a05\u0a71\u0a2a\u0a32\u0a4b\u0a21 \u0a15\u0a30\u0a4b \u2014 \u0a05\u0a71\u0a2a\u0a32\u0a4b\u0a21 \u0a24\u0a41\u0a39\u0a3e\u0a21\u0a47 \u0a16\u0a3e\u0a24\u0a47 \u0a35\u0a3f\u0a71\u0a1a \u0a38\u0a41\u0a30\u0a71\u0a16\u0a3f\u0a05\u0a24 \u0a39\u0a4b \u0a1c\u0a3e\u0a02\u0a26\u0a47 \u0a39\u0a28, \u0a07\u0a38 \u0a32\u0a08 \u0a1c\u0a26\u0a4b\u0a02 \u0a24\u0a41\u0a38\u0a40\u0a02 \u0a2a\u0a4d\u0a30\u0a15\u0a3e\u0a38\u0a3c\u0a3f\u0a24 \u0a15\u0a30\u0a26\u0a47 \u0a39\u0a4b \u0a24\u0a3e\u0a02 \u0a09\u0a39 \u0a09\u0a71\u0a25\u0a47 \u0a39\u0a41\u0a70\u0a26\u0a47 \u0a39\u0a28\u0964 \u0a07\u0a71\u0a15 \u0a21\u0a3f\u0a1c\u0a3c\u0a3e\u0a08\u0a28, \u0a26\u0a41\u0a2c\u0a08 \u0a38\u0a3f\u0a32\u0a15, \u0a06\u0a2a\u0a23\u0a47 \u0a16\u0a41\u0a26 \u0a26\u0a47 \u0a25\u0a40\u0a2e \u0a1f\u0a30\u0a48\u0a15 \u0a28\u0a3e\u0a32 \u0a06\u0a09\u0a02\u0a26\u0a3e \u0a39\u0a48; \u0a2c\u0a3e\u0a15\u0a40 \u0a21\u0a3f\u0a1c\u0a3c\u0a3e\u0a08\u0a28 \u0a09\u0a26\u0a4b\u0a02 \u0a24\u0a71\u0a15 \u0a38\u0a3c\u0a3e\u0a02\u0a24 \u0a30\u0a39\u0a3f\u0a70\u0a26\u0a47 \u0a39\u0a28 \u0a1c\u0a26\u0a4b\u0a02 \u0a24\u0a71\u0a15 \u0a24\u0a41\u0a38\u0a40\u0a02 \u0a38\u0a70\u0a17\u0a40\u0a24 \u0a28\u0a39\u0a40\u0a02 \u0a1a\u0a41\u0a23\u0a26\u0a47\u0964",
  "faq.q7":
    "\u0a15\u0a40 \u0a2e\u0a39\u0a3f\u0a2e\u0a3e\u0a28\u0a3e\u0a02 \u0a26\u0a40 \u0a17\u0a3f\u0a23\u0a24\u0a40 \u0a1c\u0a3e\u0a02 \u0a32\u0a3f\u0a70\u0a15 \u0a15\u0a3f\u0a70\u0a28\u0a40 \u0a35\u0a3e\u0a30 \u0a16\u0a4b\u0a32\u0a4d\u0a39\u0a3f\u0a06 \u0a17\u0a3f\u0a06, \u0a07\u0a38 '\u0a24\u0a47 \u0a15\u0a4b\u0a08 \u0a38\u0a40\u0a2e\u0a3e \u0a39\u0a48?",
  "faq.a7":
    "\u0a28\u0a39\u0a40\u0a02\u0964 \u0a06\u0a2a\u0a23\u0a3e \u0a32\u0a3f\u0a70\u0a15 \u0a1c\u0a3f\u0a70\u0a28\u0a47 \u0a1a\u0a3e\u0a39\u0a4b \u0a2e\u0a39\u0a3f\u0a2e\u0a3e\u0a28\u0a3e\u0a02 \u0a28\u0a3e\u0a32, \u0a15\u0a3f\u0a70\u0a28\u0a47 \u0a35\u0a40 \u0a17\u0a30\u0a41\u0a71\u0a2a\u0a3e\u0a02 \u0a35\u0a3f\u0a71\u0a1a \u0a38\u0a3e\u0a02\u0a1d\u0a3e \u0a15\u0a30\u0a4b \u2014 \u0a15\u0a4b\u0a08 \u0a2e\u0a39\u0a3f\u0a2e\u0a3e\u0a28 \u0a38\u0a40\u0a2e\u0a3e \u0a28\u0a39\u0a40\u0a02 \u0a05\u0a24\u0a47 \u0a26\u0a47\u0a16\u0a23 \u0a26\u0a40 \u0a15\u0a4b\u0a08 \u0a38\u0a40\u0a2e\u0a3e \u0a28\u0a39\u0a40\u0a02\u0964",
  "faq.q8":
    "\u0a15\u0a40 \u0a2e\u0a39\u0a3f\u0a2e\u0a3e\u0a28\u0a3e\u0a02 \u0a28\u0a42\u0a70 \u0a15\u0a41\u0a1d \u0a07\u0a70\u0a38\u0a1f\u0a3e\u0a32 \u0a15\u0a30\u0a28 \u0a1c\u0a3e\u0a02 \u0a38\u0a3e\u0a08\u0a28 \u0a05\u0a71\u0a2a \u0a15\u0a30\u0a28 \u0a26\u0a40 \u0a32\u0a4b\u0a5c \u0a39\u0a48?",
  "faq.a8":
    "\u0a28\u0a39\u0a40\u0a02\u0964 \u0a32\u0a3f\u0a70\u0a15 \u0a38\u0a3f\u0a71\u0a27\u0a3e \u0a09\u0a28\u0a4d\u0a39\u0a3e\u0a02 \u0a26\u0a47 \u0a2b\u0a3c\u0a4b\u0a28 \u0a26\u0a47 \u0a2c\u0a4d\u0a30\u0a3e\u0a0a\u0a1c\u0a3c\u0a30 \u0a35\u0a3f\u0a71\u0a1a \u0a16\u0a41\u0a71\u0a32\u0a4d\u0a39\u0a26\u0a3e \u0a39\u0a48 \u2014 \u0a15\u0a4b\u0a08 \u0a10\u0a2a \u0a28\u0a39\u0a40\u0a02, \u0a15\u0a4b\u0a08 \u0a16\u0a3e\u0a24\u0a3e \u0a28\u0a39\u0a40\u0a02, \u0a07\u0a70\u0a38\u0a1f\u0a3e\u0a32 \u0a15\u0a30\u0a28 \u0a32\u0a08 \u0a15\u0a41\u0a1d \u0a28\u0a39\u0a40\u0a02\u0964",
  "faq.q9":
    "\u0a2a\u0a4d\u0a30\u0a15\u0a3e\u0a38\u0a3c\u0a3f\u0a24 \u0a15\u0a30\u0a28 \u0a24\u0a4b\u0a02 \u0a2c\u0a3e\u0a05\u0a26 \u0a1c\u0a47 \u0a2e\u0a48\u0a28\u0a42\u0a70 \u0a07\u0a39 \u0a2a\u0a38\u0a70\u0a26 \u0a28\u0a3e \u0a06\u0a35\u0a47 \u0a24\u0a3e\u0a02?",
  "faq.a9":
    "\u0a24\u0a41\u0a38\u0a40\u0a02 \u0a2c\u0a3f\u0a28\u0a3e\u0a02 \u0a15\u0a3f\u0a38\u0a47 \u0a35\u0a3e\u0a27\u0a42 \u0a32\u0a3e\u0a17\u0a24 \u0a26\u0a47 \u0a2a\u0a4d\u0a30\u0a15\u0a3e\u0a38\u0a3c\u0a3f\u0a24 \u0a38\u0a71\u0a26\u0a47 \u0a28\u0a42\u0a70 \u0a38\u0a70\u0a2a\u0a3e\u0a26\u0a3f\u0a24 \u0a15\u0a30\u0a26\u0a47 \u0a30\u0a39\u0a3f \u0a38\u0a15\u0a26\u0a47 \u0a39\u0a4b\u0964 \u0a1c\u0a47 \u0a15\u0a41\u0a1d \u0a38\u0a71\u0a1a\u0a2e\u0a41\u0a71\u0a1a \u0a16\u0a30\u0a3e\u0a2c \u0a39\u0a48, \u0a24\u0a3e\u0a02 \u0a38\u0a3e\u0a21\u0a40 \u0a30\u0a3f\u0a2b\u0a70\u0a21 \u0a28\u0a40\u0a24\u0a40 \u0a35\u0a47\u0a16\u0a4b \u2014 \u0a05\u0a38\u0a40\u0a02 \u0a07\u0a38\u0a28\u0a42\u0a70 \u0a20\u0a40\u0a15 \u0a15\u0a30\u0a3e\u0a02\u0a17\u0a47 \u0a1c\u0a3e\u0a02 \u0a24\u0a41\u0a39\u0a3e\u0a28\u0a42\u0a70 \u0a30\u0a3f\u0a2b\u0a70\u0a21 \u0a26\u0a47\u0a35\u0a3e\u0a02\u0a17\u0a47\u0964",
  "faq.q10":
    "\u0a1c\u0a47 \u0a2e\u0a48\u0a02 \u0a2b\u0a38 \u0a1c\u0a3e\u0a35\u0a3e\u0a02 \u0a24\u0a3e\u0a02 \u0a15\u0a40 \u0a2e\u0a48\u0a28\u0a42\u0a70 \u0a2e\u0a26\u0a26 \u0a2e\u0a3f\u0a32 \u0a38\u0a15\u0a26\u0a40 \u0a39\u0a48?",
  "faq.a10":
    "\u0a39\u0a3e\u0a02 \u2014 \u0a38\u0a3e\u0a21\u0a47 \u0a38\u0a70\u0a2a\u0a30\u0a15 \u0a2a\u0a47\u0a1c \u0a24\u0a4b\u0a02 \u0a15\u0a3f\u0a38\u0a47 \u0a35\u0a40 \u0a38\u0a2e\u0a47\u0a02 \u0a38\u0a3e\u0a21\u0a47 \u0a28\u0a3e\u0a32 \u0a38\u0a70\u0a2a\u0a30\u0a15 \u0a15\u0a30\u0a4b \u0a05\u0a24\u0a47 \u0a05\u0a38\u0a40\u0a02 \u0a24\u0a41\u0a39\u0a3e\u0a21\u0a3e \u0a38\u0a71\u0a26\u0a3e \u0a24\u0a3f\u0a06\u0a30 \u0a15\u0a30\u0a28 \u0a35\u0a3f\u0a71\u0a1a \u0a2e\u0a26\u0a26 \u0a15\u0a30\u0a3e\u0a02\u0a17\u0a47\u0964",
  "closing.shubhVivah": "\u0a38\u0a3c\u0a41\u0a2d \u0a35\u0a3f\u0a06\u0a39",
  "closing.heading": "\u0a07\u0a71\u0a15",
  "closing.headingEm": "\u0a16\u0a42\u0a2c\u0a38\u0a42\u0a30\u0a24",
  "closing.headingSuffix":
    "\u0a38\u0a32\u0a3e\u0a2e \u0a28\u0a3e\u0a32 \u0a38\u0a3c\u0a41\u0a30\u0a42\u0a06\u0a24 \u0a15\u0a30\u0a4b\u0964",
  "closing.createYours": "\u0a06\u0a2a\u0a23\u0a3e \u0a2c\u0a23\u0a3e\u0a13",
};

const ur: Partial<Dictionary> = {
  "nav.designs": "ڈیزائنز",
  "nav.howItWorks": "یہ کیسے کام کرتا ہے",
  "nav.pricing": "قیمت",
  "nav.faq": "اکثر پوچھے گئے سوالات",
  "nav.createYours": "اپنا بنائیں",
  "nav.signIn": "سائن ان کریں",
  "nav.dashboard": "ڈیش بورڈ",
  "nav.signOut": "سائن آؤٹ کریں",
  "nav.openMenu": "مینو کھولیں",
  "nav.closeMenu": "مینو بند کریں",
  "nav.primaryLabel": "مرکزی",
  "footer.tagline":
    "ہر مہمان کے فون کے لیے متحرک شادی کے دعوت نامے۔ کوئی فزیکل پروڈکٹ نہیں بھیجا جاتا۔",
  "footer.explore": "دیکھیں",
  "footer.policies": "پالیسیاں",
  "footer.terms": "شرائط",
  "footer.privacy": "رازداری",
  "footer.refunds": "رقم کی واپسی",
  "footer.contact": "رابطہ کریں",
  "footer.copy": "محبت سے بنایا گیا، محبت کے لیے۔",
  "hero.eyebrow": "ڈیجیٹل شادی کے دعوت نامے",
  "hero.titleLine1": "ایک دعوت نامہ",
  "hero.titleOpenPrefix": "جسے وہ ",
  "hero.titleOpen": "دو بار کھولیں گے",
  "hero.titleLine3": "",
  "hero.lede":
    "لفافے جو کھلتے ہیں، محل کے دروازے جو الگ ہوتے ہیں، سنہری ورق کے نیچے ظاہر ہوتی تاریخ۔ آپ کے خاص دن کے لیے آپ کا اپنا ذاتی ویب پیج — ایک واٹس ایپ لنک میں شیئر کریں۔",
  "hero.browseDesigns": "{count} ڈیزائنز دیکھیں",
  "hero.noteStrong": "لامحدود حسب ضرورت تبدیلی",
  "hero.noteRest": "ہمیشہ مفت",
  "theme.preview": "پیش منظر",
  "theme.useDesign": "یہ ڈیزائن استعمال کریں",
  "editor.design": "ڈیزائن",
  "editor.yourNames": "آپ کے نام",
  "editor.name": "نام",
  "editor.partnersName": "ساتھی کا نام",
  "editor.families": "خاندان",
  "editor.familiesNote":
    "ہندوستانی دعوت ناموں میں والدین کے نام دیے جاتے ہیں؛ چھوڑنا ہو تو خالی رکھیں۔",
  "editor.firstSide": "پہلا فریق",
  "editor.secondSide": "دوسرا فریق",
  "editor.parents": "والدین",
  "editor.grandparents": "دادا دادی/نانا نانی",
  "editor.qualifications": "قابلیت",
  "editor.openingText": "ابتدائی متن",
  "editor.openingTextHint":
    "اختیاری — زیادہ تر دعوت نامے مرکزی تصویر سے سیدھا ناموں کی طرف جاتے ہیں، جو سب سے صاف لگتا ہے۔ ناموں کے اوپر ایک سطر چاہیے تو ہی یہ بھریں۔",
  "editor.welcomeLine": "استقبالیہ سطر",
  "editor.blessingOrVerse": "دعا یا شعر",
  "editor.attribution": "منسوب",
  "editor.theDay": "دن",
  "editor.occasion": "موقع",
  "editor.dateAndTime": "تاریخ اور وقت",
  "editor.venue": "مقام",
  "editor.googleMapsLink": "گوگل میپس لنک",
  "editor.mapsHint":
    "اختیاری — خالی رکھیں اور مقام کے نام پر ٹیپ کرنے سے خود بخود گوگل میپس پر تلاش ہوگی۔ مہمانوں کو کسی خاص پن پر بھیجنا ہو تو ہی یہاں لنک پیسٹ کریں۔",
  "editor.yourFunctions": "آپ کی تقریبات",
  "editor.addFunction": "تقریب شامل کریں",
  "editor.replies": "جوابات",
  "editor.whatsappNumber": "واٹس ایپ نمبر",
  "editor.replyBy": "اس تاریخ تک جواب دیں",
  "editor.yourHashtag": "آپ کا ہیش ٹیگ",
  "editor.travelStay": "سفر اور قیام",
  "editor.gettingThere": "وہاں کیسے پہنچیں",
  "editor.whereToStay": "کہاں قیام کریں",
  "editor.goodToKnow": "جاننا ضروری",
  "editor.music": "موسیقی",
  "editor.photos": "تصاویر",
  "editor.yourStory": "آپ کی کہانی",
  "editor.lineForGuests": "مہمانوں کے لیے ایک سطر",
  "editor.togetherSince": "کب سے ساتھ ہیں",
  "editor.replayOpening": "آغاز دوبارہ دیکھیں",
  "editor.previewNote":
    "یہ ایک لائیو پیش منظر ہے — بائیں طرف کی گئی ہر تبدیلی یہاں فوراً نظر آتی ہے۔ کوئی خانہ خالی چھوڑیں تو وہ آپ کے دعوت نامے میں بالکل نہیں آئے گا؛ کبھی کوئی خالی سطر یا نمونہ متن نظر نہیں آتا۔ نمونہ تصاویر اس پیش منظر میں صرف خالی تصویر خانوں میں نظر آ سکتی ہیں — مہمان وہ خانے خالی دیکھتے ہیں جب تک آپ اپنی تصاویر شامل نہیں کرتے۔",
  "collection.eyebrow": "\u0645\u062c\u0645\u0648\u0639\u06c1",
  "collection.heading":
    "{count} \u0637\u0631\u06cc\u0642\u06d2 \u06a9\u06c1\u0646\u06d2 \u06a9\u06d2",
  "collection.headingEm": "\u0633\u06cc\u0648 \u062f\u06cc \u0688\u06cc\u0679",
  "collection.sub":
    "\u06c1\u0631 \u0688\u06cc\u0632\u0627\u0626\u0646 \u067e\u06c1\u0644\u06d2 \u0679\u06cc\u067e \u0633\u06d2 \u0644\u06d2 \u06a9\u0631 \u0622\u062e\u0631\u06cc \u06a9\u0627\u0624\u0646\u0679 \u0688\u0627\u0624\u0646 \u062a\u06a9 \u0627\u06cc\u06a9 \u0645\u06a9\u0645\u0644 \u0645\u062a\u062d\u0631\u06a9 \u062a\u062c\u0631\u0628\u06c1 \u06c1\u06d2\u06d4",
  "collection.seeAll":
    "\u062a\u0645\u0627\u0645 {count} \u0688\u06cc\u0632\u0627\u0626\u0646 \u062f\u06cc\u06a9\u06be\u06cc\u06ba",
  "how.eyebrow":
    "\u06cc\u06c1 \u06a9\u06cc\u0633\u06d2 \u06a9\u0627\u0645 \u06a9\u0631\u062a\u0627 \u06c1\u06d2",
  "how.heading": "\u0627\u06cc\u06a9 \u0634\u0627\u0645 \u0645\u06cc\u06ba",
  "how.headingEm": "\u062a\u06cc\u0627\u0631",
  "steps.1.title":
    "\u0627\u06cc\u06a9 \u0688\u06cc\u0632\u0627\u0626\u0646 \u0645\u0646\u062a\u062e\u0628 \u06a9\u0631\u06cc\u06ba",
  "steps.1.body":
    "{count} \u0645\u062a\u062d\u0631\u06a9 \u062f\u0639\u0648\u062a \u0646\u0627\u0645\u06d2 \u062f\u06cc\u06a9\u06be\u06cc\u06ba \u2014 \u0634\u0627\u06c1\u06cc\u060c \u062c\u062f\u06cc\u062f\u060c \u067e\u06be\u0648\u0644\u0648\u06ba \u0648\u0627\u0644\u06d2\u060c \u0645\u0646\u0632\u0644\u06d4 \u06c1\u0631 \u0627\u06cc\u06a9 \u06a9\u0648 \u0628\u0627\u0644\u06a9\u0644 \u0627\u0633\u06cc \u0637\u0631\u062d \u062f\u06cc\u06a9\u06be\u06cc\u06ba \u062c\u06cc\u0633\u06d2 \u0622\u067e \u06a9\u06d2 \u0645\u06c1\u0645\u0627\u0646 \u062f\u06cc\u06a9\u06be\u06cc\u06ba \u06af\u06d2\u06d4",
  "steps.2.title":
    "\u0645\u0641\u062a \u0645\u06cc\u06ba \u062a\u062e\u0635\u06cc\u0635 \u06a9\u0631\u06cc\u06ba",
  "steps.2.body":
    "\u0627\u067e\u0646\u06d2 \u0646\u0627\u0645\u060c \u062a\u0627\u0631\u06cc\u062e\u06cc\u06ba\u060c \u0645\u0642\u0627\u0645\u0627\u062a\u060c \u0645\u06c1\u0646\u062f\u06cc \u0633\u06d2 \u0627\u0633\u062a\u0642\u0628\u0627\u0644\u06cc\u06c1 \u062a\u06a9 \u06c1\u0631 \u062a\u0642\u0631\u06cc\u0628\u060c \u0627\u067e\u0646\u06cc \u062a\u0635\u0627\u0648\u06cc\u0631 \u0627\u0648\u0631 \u0645\u0648\u0633\u06cc\u0642\u06cc \u0634\u0627\u0645\u0644 \u06a9\u0631\u06cc\u06ba\u06d4 \u062c\u062a\u0646\u06cc \u0628\u0627\u0631 \u0686\u0627\u06c1\u06cc\u06ba \u062a\u0628\u062f\u06cc\u0644 \u06a9\u0631\u06cc\u06ba\u06d4",
  "steps.3.title":
    "\u0627\u06cc\u06a9 \u0628\u0627\u0631 \u0627\u062f\u0627\u0626\u06cc\u06af\u06cc \u06a9\u0631\u06cc\u06ba\u060c \u0634\u06cc\u0626\u0631 \u06a9\u0631\u06cc\u06ba",
  "steps.3.body":
    "\u20b9599 \u0645\u06cc\u06ba \u0634\u0627\u0626\u0639 \u06a9\u0631\u06cc\u06ba \u0627\u0648\u0631 \u0627\u067e\u0646\u0627 \u062e\u0648\u062f \u06a9\u0627 \u0644\u0646\u06a9 \u062d\u0627\u0635\u0644 \u06a9\u0631\u06cc\u06ba\u06d4 \u0627\u0633\u06d2 \u0648\u0627\u0679\u0633 \u0627\u06cc\u067e\u060c \u0627\u0646\u0633\u0679\u0627\u06af\u0631\u0627\u0645\u060c \u06a9\u06c1\u06cc\u06ba \u0628\u06be\u06cc \u0628\u06be\u06cc\u062c\u06cc\u06ba \u2014 \u06cc\u06c1 \u06a9\u0633\u06cc \u0628\u06be\u06cc \u0641\u0648\u0646 \u067e\u0631 \u062e\u0648\u0628\u0635\u0648\u0631\u062a\u06cc \u0633\u06d2 \u06a9\u06be\u0644\u062a\u0627 \u06c1\u06d2\u06d4",
  "compare.eyebrow":
    "\u0688\u06cc\u062c\u06cc\u0679\u0644 \u06a9\u06cc\u0648\u06ba \u0686\u0646\u06cc\u06ba",
  "compare.heading": "\u06a9\u0627\u063a\u0630",
  "compare.headingEm": "\u0628\u0645\u0642\u0627\u0628\u0644\u06c1",
  "compare.headingSuffix": "\u0688\u06cc\u062c\u06cc\u0679\u0644",
  "compare.colFeature": "\u062e\u0635\u0648\u0635\u06cc\u062a",
  "compare.colPaper": "\u06a9\u0627\u063a\u0630",
  "compare.colDigital": "\u0688\u06cc\u062c\u06cc\u0679\u0644",
  "compare.row.cost.feature": "\u0644\u0627\u06af\u062a",
  "compare.row.cost.paper":
    "\u20b9150\u2013\u20b9500+ \u0641\u06cc \u06a9\u0627\u0631\u0688\u060c \u0628\u0644\u0627\u0648\u06c1 \u067e\u0631\u0646\u0679\u0646\u06af",
  "compare.row.cost.digital": "\u20b9599 \u0627\u06cc\u06a9 \u0628\u0627\u0631",
  "compare.row.delivery.feature":
    "\u062a\u0631\u0633\u06cc\u0644 \u06a9\u0627 \u0648\u0642\u062a",
  "compare.row.delivery.paper":
    "\u067e\u0631\u0646\u0679\u0646\u06af \u0627\u0648\u0631 \u06a9\u0648\u0631\u06cc\u0626\u0631 \u06a9\u06d2 \u0644\u06cc\u06d2 1\u20132 \u06c1\u0641\u062a\u06d2",
  "compare.row.delivery.digital": "\u0641\u0648\u0631\u06cc",
  "compare.row.animation.feature":
    "\u0627\u0648\u067e\u0646\u0646\u06af \u0627\u06cc\u0646\u06cc\u0645\u06cc\u0634\u0646",
  "compare.row.music.feature":
    "\u067e\u0633 \u0645\u0646\u0638\u0631 \u06a9\u06cc \u0645\u0648\u0633\u06cc\u0642\u06cc",
  "compare.row.countdown.feature":
    "\u0644\u0627\u0626\u06cc\u0648 \u06a9\u0627\u0624\u0646\u0679 \u0688\u0627\u0624\u0646",
  "compare.row.editable.feature":
    "\u0628\u06be\u06cc\u062c\u0646\u06d2 \u06a9\u06d2 \u0628\u0639\u062f \u0628\u06be\u06cc \u0642\u0627\u0628\u0644\u0650 \u062a\u0631\u0645\u06cc\u0645",
  "compare.row.maps.feature":
    "\u06af\u0648\u06af\u0644 \u0645\u06cc\u067e\u0633 \u0633\u0645\u062a",
  "compare.row.guests.feature":
    "\u0644\u0627\u0645\u062d\u062f\u0648\u062f \u0645\u06c1\u0645\u0627\u0646 \u0627\u0648\u0631 \u0634\u06cc\u0626\u0631\u0632",
  "compare.row.whatsapp.feature":
    "\u0648\u0627\u0679\u0633 \u0627\u06cc\u067e \u067e\u0631 \u0642\u0627\u0628\u0644\u0650 \u0627\u0634\u062a\u0631\u0627\u06a9",
  "pricing.eyebrow": "\u0642\u06cc\u0645\u062a",
  "pricing.heading1": "\u0627\u06cc\u06a9 \u0642\u06cc\u0645\u062a\u06d4",
  "pricing.heading2":
    "\u06a9\u0648\u0626\u06cc \u0631\u06a9\u0646\u06cc\u062a \u0646\u06c1\u06cc\u06ba\u06d4",
  "pricing.body":
    "\u0628\u063a\u06cc\u0631 \u06a9\u0633\u06cc \u0644\u0627\u06af\u062a \u06a9\u06d2 \u062c\u062a\u0646\u0627 \u0686\u0627\u06c1\u06cc\u06ba \u0688\u06cc\u0632\u0627\u0626\u0646 \u0627\u0648\u0631 \u067e\u06cc\u0634 \u0645\u0646\u0638\u0631 \u062f\u06cc\u06a9\u06be\u06cc\u06ba\u06d4 \u062f\u0646\u06cc\u0627 \u06a9\u06d2 \u0633\u0627\u062a\u06be \u0634\u06cc\u0626\u0631 \u06a9\u0631\u0646\u06d2 \u06a9\u06d2 \u0644\u06cc\u06d2 \u062a\u06cc\u0627\u0631 \u06c1\u0648\u06ba \u062a\u0628 \u06c1\u06cc \u0627\u062f\u0627\u0626\u06cc\u06af\u06cc \u06a9\u0631\u06cc\u06ba\u06d4",
  "pricing.theInvitation": "\u062f\u0639\u0648\u062a \u0646\u0627\u0645\u06c1",
  "pricing.oneTime": "\u0627\u06cc\u06a9 \u0628\u0627\u0631",
  "pricing.startCustomising":
    "\u0645\u0641\u062a \u0645\u06cc\u06ba \u062a\u062e\u0635\u06cc\u0635 \u06a9\u0631\u0646\u0627 \u0634\u0631\u0648\u0639 \u06a9\u0631\u06cc\u06ba",
  "included.0":
    "\u06c1\u0645\u0627\u0631\u06d2 {count} \u0645\u062a\u062d\u0631\u06a9 \u0688\u06cc\u0632\u0627\u0626\u0646\u0648\u06ba \u0645\u06cc\u06ba \u0633\u06d2 \u06a9\u0648\u0626\u06cc \u0628\u06be\u06cc",
  "included.1":
    "\u0644\u0627\u0645\u062d\u062f\u0648\u062f \u062a\u0642\u0631\u06cc\u0628\u0627\u062a \u2014 \u0645\u06c1\u0646\u062f\u06cc \u0633\u06d2 \u0627\u0633\u062a\u0642\u0628\u0627\u0644\u06cc\u06c1 \u062a\u06a9",
  "included.2":
    "\u0641\u0648\u0679\u0648 \u06af\u06cc\u0644\u0631\u06cc\u060c \u0645\u0648\u0633\u06cc\u0642\u06cc \u0627\u0648\u0631 \u0644\u0627\u0626\u06cc\u0648 \u06a9\u0627\u0624\u0646\u0679 \u0688\u0627\u0624\u0646",
  "included.3":
    "\u06c1\u0631 \u0645\u0642\u0627\u0645 \u06a9\u06d2 \u0644\u06cc\u06d2 \u06af\u0648\u06af\u0644 \u0645\u06cc\u067e\u0633 \u0633\u0645\u062a",
  "included.4":
    "\u0644\u0627\u0645\u062d\u062f\u0648\u062f \u0645\u06c1\u0645\u0627\u0646\u060c \u0644\u0627\u0645\u062d\u062f\u0648\u062f \u0634\u06cc\u0626\u0631\u0632",
  "included.5":
    "\u0634\u0627\u0626\u0639 \u06a9\u0631\u0646\u06d2 \u06a9\u06d2 \u0628\u0639\u062f \u06a9\u0633\u06cc \u0628\u06be\u06cc \u0648\u0642\u062a \u062a\u0641\u0635\u06cc\u0644\u0627\u062a \u062a\u0628\u062f\u06cc\u0644 \u06a9\u0631\u06cc\u06ba",
  "faq.eyebrow": "\u0633\u0648\u0627\u0644\u0627\u062a",
  "faq.heading": "\u0634\u0631\u0648\u0639 \u06a9\u0631\u0646\u06d2",
  "faq.headingEm": "\u0633\u06d2 \u067e\u06c1\u0644\u06d2",
  "faq.q0":
    "\u06a9\u06cc\u0627 \u0688\u06cc\u0632\u0627\u0626\u0646 \u06a9\u0631\u0646\u0627 \u0648\u0627\u0642\u0639\u06cc \u0645\u0641\u062a \u06c1\u06d2\u061f",
  "faq.a0":
    "جی ہاں۔ کوئی بھی ڈیزائن منتخب کریں، اپنے نام، تاریخیں اور مقامات شامل کریں، اور پوری چیز کو اپنے فون پر دیکھیں — سب مفت۔ اپنی تصاویر یا موسیقی شامل کرنے کے لیے صرف ایک مفت اکاؤنٹ درکار ہے۔ آپ صرف شائع کرتے وقت ادائیگی کرتے ہیں۔",
  "faq.q1":
    "\u20b9599 \u062f\u0631\u0627\u0635\u0644 \u06a9\u0633 \u0686\u06cc\u0632 \u06a9\u06d2 \u0644\u06cc\u06d2 \u06c1\u06cc\u06ba\u061f",
  "faq.a1":
    "\u0627\u06cc\u06a9 \u062f\u0639\u0648\u062a \u0646\u0627\u0645\u06c1\u060c \u0627\u06cc\u06a9 \u0628\u0627\u0631 \u0634\u0627\u0626\u0639 \u0634\u062f\u06c1\u060c \u0627\u067e\u0646\u06d2 \u062e\u0648\u062f \u06a9\u06d2 \u0642\u0627\u0628\u0644\u0650 \u0627\u0634\u062a\u0631\u0627\u06a9 \u0644\u0646\u06a9 \u06a9\u06d2 \u0633\u0627\u062a\u06be \u2014 \u06a9\u0648\u0626\u06cc \u0648\u0627\u0679\u0631\u0645\u0627\u0631\u06a9 \u0646\u06c1\u06cc\u06ba\u060c \u06a9\u0648\u0626\u06cc \u0631\u06a9\u0646\u06cc\u062a \u0646\u06c1\u06cc\u06ba\u060c \u0641\u06cc \u0645\u06c1\u0645\u0627\u0646 \u06a9\u0648\u0626\u06cc \u0686\u0627\u0631\u062c \u0646\u06c1\u06cc\u06ba\u06d4 \u0622\u067e \u0634\u0627\u062f\u06cc \u062a\u06a9 \u0634\u0627\u0626\u0639 \u06a9\u0631\u0646\u06d2 \u06a9\u06d2 \u0628\u0639\u062f \u0628\u06be\u06cc \u0627\u0633\u06d2 \u062a\u0631\u0645\u06cc\u0645 \u06a9\u0631\u062a\u06d2 \u0631\u06c1 \u0633\u06a9\u062a\u06d2 \u06c1\u06cc\u06ba\u06d4",
  "faq.q2":
    "\u06a9\u06cc\u0627 \u0645\u06cc\u06ba \u0645\u06c1\u0646\u062f\u06cc\u060c \u0633\u0646\u06af\u06cc\u062a \u0627\u0648\u0631 \u0627\u0633\u062a\u0642\u0628\u0627\u0644\u06cc\u06c1 \u0627\u0644\u06af \u0627\u0644\u06af \u0634\u0627\u0645\u0644 \u06a9\u0631 \u0633\u06a9\u062a\u0627/\u0633\u06a9\u062a\u06cc \u06c1\u0648\u06ba\u061f",
  "faq.a2":
    "\u062c\u06cc \u06c1\u0627\u06ba \u2014 \u062c\u062a\u0646\u06cc \u0686\u0627\u06c1\u06cc\u06ba \u062a\u0642\u0631\u06cc\u0628\u0627\u062a \u0634\u0627\u0645\u0644 \u06a9\u0631\u06cc\u06ba\u060c \u06c1\u0631 \u0627\u06cc\u06a9 \u06a9\u06cc \u0627\u067e\u0646\u06cc \u062a\u0627\u0631\u06cc\u062e\u060c \u0648\u0642\u062a\u060c \u0645\u0642\u0627\u0645 \u0627\u0648\u0631 \u0688\u0631\u06cc\u0633 \u06a9\u0648\u0688 \u06a9\u06d2 \u0633\u0627\u062a\u06be\u060c \u0633\u0628 \u0627\u06cc\u06a9 \u06c1\u06cc \u062f\u0639\u0648\u062a \u0646\u0627\u0645\u06d2 \u06a9\u06d2 \u0644\u0646\u06a9 \u0645\u06cc\u06ba\u06d4",
  "faq.q3":
    "\u06a9\u06cc\u0627 \u06cc\u06c1 \u0627\u0646 \u0645\u06c1\u0645\u0627\u0646\u0648\u06ba \u06a9\u06d2 \u0644\u06cc\u06d2 \u06a9\u0627\u0645 \u06a9\u0631\u06d2 \u06af\u0627 \u062c\u0648 \u0648\u0627\u0679\u0633 \u0627\u06cc\u067e \u067e\u0631 \u0646\u06c1\u06cc\u06ba \u06c1\u06cc\u06ba\u061f",
  "faq.a3":
    "\u0644\u0646\u06a9 \u0627\u06cc\u06a9 \u0639\u0627\u0645 \u0648\u06cc\u0628 \u067e\u06cc\u062c \u06c1\u06d2\u060c \u0627\u0633 \u0644\u06cc\u06d2 \u06cc\u06c1 \u0627\u06cc\u0633 \u0627\u06cc\u0645 \u0627\u06cc\u0633\u060c \u0627\u0646\u0633\u0679\u0627\u06af\u0631\u0627\u0645\u060c \u0627\u06cc \u0645\u06cc\u0644 \u06cc\u0627 \u06a9\u0633\u06cc \u0627\u0648\u0631 \u0627\u06cc\u067e \u067e\u0631 \u0628\u06be\u06cc \u0627\u0633\u06cc \u0637\u0631\u062d \u06a9\u06be\u0644\u062a\u0627 \u06c1\u06d2 \u2014 \u0648\u0627\u0679\u0633 \u0627\u06cc\u067e \u0628\u06be\u06cc\u062c\u0646\u06d2 \u06a9\u0627 \u0635\u0631\u0641 \u0633\u0628 \u0633\u06d2 \u0622\u0633\u0627\u0646 \u0637\u0631\u06cc\u0642\u06c1 \u06c1\u06d2\u06d4",
  "faq.q4":
    "\u0644\u0646\u06a9 \u0634\u06cc\u0626\u0631 \u06a9\u0631\u0646\u06d2 \u06a9\u06d2 \u0628\u0639\u062f \u06a9\u06cc\u0627 \u0645\u06cc\u06ba \u062a\u0641\u0635\u06cc\u0644\u0627\u062a \u062a\u0628\u062f\u06cc\u0644 \u06a9\u0631 \u0633\u06a9\u062a\u0627/\u0633\u06a9\u062a\u06cc \u06c1\u0648\u06ba\u061f",
  "faq.a4":
    "\u062c\u06cc \u06c1\u0627\u06ba\u06d4 \u0627\u067e\u0646\u06cc \u062a\u0642\u0631\u06cc\u0628 \u0633\u06d2 \u067e\u06c1\u0644\u06d2 \u06a9\u0633\u06cc \u0628\u06be\u06cc \u0648\u0642\u062a \u0646\u0627\u0645\u060c \u062a\u0627\u0631\u06cc\u062e\u06cc\u06ba\u060c \u0645\u0642\u0627\u0645\u0627\u062a \u06cc\u0627 \u062a\u0635\u0627\u0648\u06cc\u0631 \u062a\u0628\u062f\u06cc\u0644 \u06a9\u0631\u06cc\u06ba \u2014 \u0644\u0646\u06a9 \u0648\u06c1\u06cc \u0631\u06c1\u062a\u0627 \u06c1\u06d2\u060c \u0627\u0633 \u0644\u06cc\u06d2 \u0645\u06c1\u0645\u0627\u0646\u0648\u06ba \u06a9\u0648 \u06c1\u0645\u06cc\u0634\u06c1 \u062a\u0627\u0632\u06c1 \u062a\u0631\u06cc\u0646 \u0648\u0631\u0698\u0646 \u0646\u0638\u0631 \u0622\u062a\u0627 \u06c1\u06d2\u06d4",
  "faq.q5": "\u20b9599 \u06a9\u06cc\u0648\u06ba\u061f",
  "faq.a5":
    "\u06cc\u06c1 \u0622\u067e \u06a9\u06d2 \u062f\u0639\u0648\u062a \u0646\u0627\u0645\u06d2 \u06a9\u06cc \u0645\u06cc\u0632\u0628\u0627\u0646\u06cc \u0627\u0648\u0631 \u0627\u062f\u0627\u0626\u06cc\u06af\u06cc \u0686\u0644\u0627\u0646\u06d2 \u06a9\u06cc \u0644\u0627\u06af\u062a \u067e\u0648\u0631\u06cc \u06a9\u0631\u062a\u0627 \u06c1\u06d2 \u2014 \u0633\u0631\u0648\u0631 \u0627\u0648\u0631 \u067e\u06cc\u0645\u0646\u0679 \u06af\u06cc\u0679 \u0648\u06d2 \u062f\u0648\u0646\u0648\u06ba \u0641\u06cc \u062f\u0639\u0648\u062a \u0646\u0627\u0645\u06c1 \u0686\u0627\u0631\u062c \u06a9\u0631\u062a\u06d2 \u06c1\u06cc\u06ba\u06d4 \u06c1\u0645 \u0627\u0633 \u067e\u0631 \u0632\u06cc\u0627\u062f\u06c1 \u0645\u0646\u0627\u0641\u0639 \u06a9\u0645\u0627\u0646\u06d2 \u06a9\u06cc \u06a9\u0648\u0634\u0634 \u0646\u06c1\u06cc\u06ba \u06a9\u0631 \u0631\u06c1\u06d2\u061b \u06c1\u0645 \u0628\u0633 \u0686\u0627\u06c1\u062a\u06d2 \u06c1\u06cc\u06ba \u06a9\u06c1 \u0622\u067e \u06a9\u06d2 \u067e\u0627\u0633 \u0627\u06cc\u06a9 \u0645\u06c1\u06cc\u0646\u06d2 \u0645\u06cc\u06ba \u063a\u0627\u0626\u0628 \u06c1\u0648 \u062c\u0627\u0646\u06d2 \u0648\u0627\u0644\u06d2 \u0645\u0641\u062a \u062f\u0639\u0648\u062a \u0646\u0627\u0645\u06d2 \u06a9\u06cc \u0628\u062c\u0627\u0626\u06d2 \u0627\u06cc\u06a9 \u062e\u0648\u0628\u0635\u0648\u0631\u062a \u062f\u0639\u0648\u062a \u0646\u0627\u0645\u06c1 \u06c1\u0648\u06d4",
  "faq.q6":
    "\u06a9\u06cc\u0627 \u0645\u06cc\u06ba \u0627\u067e\u0646\u06cc \u062a\u0635\u0627\u0648\u06cc\u0631 \u0627\u0648\u0631 \u0645\u0648\u0633\u06cc\u0642\u06cc \u0627\u0633\u062a\u0639\u0645\u0627\u0644 \u06a9\u0631 \u0633\u06a9\u062a\u0627/\u0633\u06a9\u062a\u06cc \u06c1\u0648\u06ba\u061f",
  "faq.a6":
    "\u062c\u06cc \u06c1\u0627\u06ba\u06d4 \u06af\u06cc\u0644\u0631\u06cc \u06a9\u06d2 \u0644\u06cc\u06d2 \u0627\u067e\u0646\u06cc \u062a\u0635\u0627\u0648\u06cc\u0631 \u0627\u067e \u0644\u0648\u0688 \u06a9\u0631\u06cc\u06ba\u060c \u0627\u0648\u0631 \u06c1\u0645\u0627\u0631\u06cc \u0644\u0627\u0626\u0628\u0631\u06cc\u0631\u06cc \u0633\u06d2 \u06a9\u0648\u0626\u06cc \u0679\u0631\u06cc\u06a9 \u0645\u0646\u062a\u062e\u0628 \u06a9\u0631\u06cc\u06ba \u06cc\u0627 \u0627\u067e\u0646\u0627 \u06af\u0627\u0646\u0627 \u0627\u067e \u0644\u0648\u0688 \u06a9\u0631\u06cc\u06ba \u2014 \u0627\u067e \u0644\u0648\u0688\u0632 \u0622\u067e \u06a9\u06d2 \u0627\u06a9\u0627\u0624\u0646\u0679 \u0645\u06cc\u06ba \u0645\u062d\u0641\u0648\u0638 \u06c1\u0648 \u062c\u0627\u062a\u06cc \u06c1\u06cc\u06ba\u060c \u0627\u0633 \u0644\u06cc\u06d2 \u062c\u0628 \u0622\u067e \u0634\u0627\u0626\u0639 \u06a9\u0631\u062a\u06d2 \u06c1\u06cc\u06ba \u062a\u0648 \u0648\u06c1 \u0648\u06c1\u0627\u06ba \u0645\u0648\u062c\u0648\u062f \u06c1\u0648\u062a\u06cc \u06c1\u06cc\u06ba\u06d4 \u0627\u06cc\u06a9 \u0688\u06cc\u0632\u0627\u0626\u0646\u060c \u062f\u0628\u0626\u06cc \u0633\u0644\u06a9\u060c \u0627\u067e\u0646\u06d2 \u062e\u0648\u062f \u06a9\u06d2 \u062a\u06be\u06cc\u0645 \u0679\u0631\u06cc\u06a9 \u06a9\u06d2 \u0633\u0627\u062a\u06be \u0622\u062a\u0627 \u06c1\u06d2\u061b \u0628\u0627\u0642\u06cc \u0688\u06cc\u0632\u0627\u0626\u0646\u0632 \u0627\u0633 \u0648\u0642\u062a \u062a\u06a9 \u062e\u0627\u0645\u0648\u0634 \u0631\u06c1\u062a\u06d2 \u06c1\u06cc\u06ba \u062c\u0628 \u062a\u06a9 \u0622\u067e \u0645\u0648\u0633\u06cc\u0642\u06cc \u0645\u0646\u062a\u062e\u0628 \u0646\u06c1\u06cc\u06ba \u06a9\u0631\u062a\u06d2\u06d4",
  "faq.q7":
    "\u06a9\u06cc\u0627 \u0645\u06c1\u0645\u0627\u0646\u0648\u06ba \u06a9\u06cc \u062a\u0639\u062f\u0627\u062f \u06cc\u0627 \u0644\u0646\u06a9 \u06a9\u062a\u0646\u06cc \u0628\u0627\u0631 \u06a9\u06be\u0648\u0644\u0627 \u06af\u06cc\u0627 \u0627\u0633 \u06a9\u06cc \u06a9\u0648\u0626\u06cc \u062d\u062f \u06c1\u06d2\u061f",
  "faq.a7":
    "\u0646\u06c1\u06cc\u06ba\u06d4 \u0627\u067e\u0646\u0627 \u0644\u0646\u06a9 \u062c\u062a\u0646\u06d2 \u0686\u0627\u06c1\u06cc\u06ba \u0645\u06c1\u0645\u0627\u0646\u0648\u06ba \u06a9\u06d2 \u0633\u0627\u062a\u06be\u060c \u06a9\u0633\u06cc \u0628\u06be\u06cc \u062a\u0639\u062f\u0627\u062f \u06a9\u06d2 \u06af\u0631\u0648\u067e\u0633 \u0645\u06cc\u06ba \u0634\u06cc\u0626\u0631 \u06a9\u0631\u06cc\u06ba \u2014 \u06a9\u0648\u0626\u06cc \u0645\u06c1\u0645\u0627\u0646 \u06a9\u06cc \u062d\u062f \u0646\u06c1\u06cc\u06ba \u0627\u0648\u0631 \u062f\u06cc\u06a9\u06be\u0646\u06d2 \u06a9\u06cc \u06a9\u0648\u0626\u06cc \u062d\u062f \u0646\u06c1\u06cc\u06ba\u06d4",
  "faq.q8":
    "\u06a9\u06cc\u0627 \u0645\u06c1\u0645\u0627\u0646\u0648\u06ba \u06a9\u0648 \u06a9\u0686\u06be \u0627\u0646\u0633\u0679\u0627\u0644 \u06a9\u0631\u0646\u06d2 \u06cc\u0627 \u0633\u0627\u0626\u0646 \u0627\u067e \u06a9\u0631\u0646\u06d2 \u06a9\u06cc \u0636\u0631\u0648\u0631\u062a \u06c1\u06d2\u061f",
  "faq.a8":
    "\u0646\u06c1\u06cc\u06ba\u06d4 \u0644\u0646\u06a9 \u0633\u06cc\u062f\u06be\u0627 \u0627\u0646 \u06a9\u06d2 \u0641\u0648\u0646 \u06a9\u06d2 \u0628\u0631\u0627\u0624\u0632\u0631 \u0645\u06cc\u06ba \u06a9\u06be\u0644\u062a\u0627 \u06c1\u06d2 \u2014 \u06a9\u0648\u0626\u06cc \u0627\u06cc\u067e \u0646\u06c1\u06cc\u06ba\u060c \u06a9\u0648\u0626\u06cc \u0627\u06a9\u0627\u0624\u0646\u0679 \u0646\u06c1\u06cc\u06ba\u060c \u0627\u0646\u0633\u0679\u0627\u0644 \u06a9\u0631\u0646\u06d2 \u06a9\u06d2 \u0644\u06cc\u06d2 \u06a9\u0686\u06be \u0646\u06c1\u06cc\u06ba\u06d4",
  "faq.q9":
    "\u0634\u0627\u0626\u0639 \u06a9\u0631\u0646\u06d2 \u06a9\u06d2 \u0628\u0639\u062f \u0627\u06af\u0631 \u0645\u062c\u06be\u06d2 \u0627\u0633 \u06a9\u06cc \u0634\u06a9\u0644 \u067e\u0633\u0646\u062f \u0646\u06c1 \u0622\u0626\u06d2 \u062a\u0648\u061f",
  "faq.a9":
    "\u0622\u067e \u0628\u063a\u06cc\u0631 \u06a9\u0633\u06cc \u0627\u0636\u0627\u0641\u06cc \u0644\u0627\u06af\u062a \u06a9\u06d2 \u0634\u0627\u0626\u0639 \u0634\u062f\u06c1 \u062f\u0639\u0648\u062a \u0646\u0627\u0645\u06d2 \u06a9\u0648 \u062a\u0631\u0645\u06cc\u0645 \u06a9\u0631\u062a\u06d2 \u0631\u06c1 \u0633\u06a9\u062a\u06d2 \u06c1\u06cc\u06ba\u06d4 \u0627\u06af\u0631 \u0648\u0627\u0642\u0639\u06cc \u06a9\u0686\u06be \u062e\u0631\u0627\u0628 \u06c1\u06d2\u060c \u062a\u0648 \u06c1\u0645\u0627\u0631\u06cc \u0631\u0642\u0645 \u06a9\u06cc \u0648\u0627\u067e\u0633\u06cc \u06a9\u06cc \u067e\u0627\u0644\u06cc\u0633\u06cc \u062f\u06cc\u06a9\u06be\u06cc\u06ba \u2014 \u06c1\u0645 \u0627\u0633\u06d2 \u0679\u06be\u06cc\u06a9 \u06a9\u0631\u06cc\u06ba \u06af\u06d2 \u06cc\u0627 \u0622\u067e \u06a9\u0648 \u0631\u0642\u0645 \u0648\u0627\u067e\u0633 \u06a9\u0631\u06cc\u06ba \u06af\u06d2\u06d4",
  "faq.q10":
    "\u0627\u06af\u0631 \u0645\u06cc\u06ba \u067e\u06be\u0646\u0633 \u062c\u0627\u0624\u06ba \u062a\u0648 \u06a9\u06cc\u0627 \u0645\u062c\u06be\u06d2 \u0645\u062f\u062f \u0645\u0644 \u0633\u06a9\u062a\u06cc \u06c1\u06d2\u061f",
  "faq.a10":
    "\u062c\u06cc \u06c1\u0627\u06ba \u2014 \u06c1\u0645\u0627\u0631\u06d2 \u0631\u0627\u0628\u0637\u06c1 \u0635\u0641\u062d\u06d2 \u0633\u06d2 \u06a9\u0633\u06cc \u0628\u06be\u06cc \u0648\u0642\u062a \u06c1\u0645 \u0633\u06d2 \u0631\u0627\u0628\u0637\u06c1 \u06a9\u0631\u06cc\u06ba \u0627\u0648\u0631 \u06c1\u0645 \u0622\u067e \u06a9\u0627 \u062f\u0639\u0648\u062a \u0646\u0627\u0645\u06c1 \u062a\u06cc\u0627\u0631 \u06a9\u0631\u0646\u06d2 \u0645\u06cc\u06ba \u0645\u062f\u062f \u06a9\u0631\u06cc\u06ba \u06af\u06d2\u06d4",
  "closing.shubhVivah": "\u0634\u0628\u06be \u0648\u06cc\u0648\u0627\u06c1",
  "closing.heading": "\u0627\u06cc\u06a9",
  "closing.headingEm": "\u062e\u0648\u0628\u0635\u0648\u0631\u062a",
  "closing.headingSuffix":
    "\u0633\u0644\u0627\u0645 \u0633\u06d2 \u0622\u063a\u0627\u0632 \u06a9\u0631\u06cc\u06ba\u06d4",
  "closing.createYours": "\u0627\u067e\u0646\u0627 \u0628\u0646\u0627\u0626\u06cc\u06ba",
};

const fr: Partial<Dictionary> = {
  "nav.designs": "Modèles",
  "nav.howItWorks": "Comment ça marche",
  "nav.pricing": "Tarifs",
  "nav.faq": "FAQ",
  "nav.createYours": "Créez la vôtre",
  "nav.signIn": "Se connecter",
  "nav.dashboard": "Tableau de bord",
  "nav.signOut": "Se déconnecter",
  "nav.openMenu": "Ouvrir le menu",
  "nav.closeMenu": "Fermer le menu",
  "nav.primaryLabel": "Principal",
  "footer.tagline":
    "Des invitations de mariage animées pour le téléphone de chaque invité. Aucun produit physique n'est expédié.",
  "footer.explore": "Explorer",
  "footer.policies": "Politiques",
  "footer.terms": "Conditions",
  "footer.privacy": "Confidentialité",
  "footer.refunds": "Remboursements",
  "footer.contact": "Contact",
  "footer.copy": "Fait avec amour, pour l'amour.",
  "hero.eyebrow": "Invitations de mariage numériques",
  "hero.titleLine1": "Une invitation",
  "hero.titleOpenPrefix": "qu'ils ",
  "hero.titleOpen": "ouvriront",
  "hero.titleLine3": "deux fois.",
  "hero.lede":
    "Des enveloppes qui se décachettent, des portes de palais qui s'écartent, une date révélée sous une feuille d'or. Votre propre page personnalisée pour votre grand jour — partagée en un lien WhatsApp.",
  "hero.browseDesigns": "Parcourir {count} modèles",
  "hero.noteStrong": "Personnalisation illimitée",
  "hero.noteRest": "toujours gratuit",
  "theme.preview": "Aperçu",
  "theme.useDesign": "Utiliser ce design",
  "editor.design": "Design",
  "editor.yourNames": "Vos noms",
  "editor.name": "Nom",
  "editor.partnersName": "Nom du partenaire",
  "editor.families": "Familles",
  "editor.familiesNote":
    "Les invitations indiennes mentionnent les parents ; laissez vide pour omettre.",
  "editor.firstSide": "Premier côté",
  "editor.secondSide": "Deuxième côté",
  "editor.parents": "Parents",
  "editor.grandparents": "Grands-parents",
  "editor.qualifications": "Qualifications",
  "editor.openingText": "Texte d'ouverture",
  "editor.openingTextHint":
    "Facultatif — la plupart des invitations passent directement de l'image principale aux noms, ce qui est le plus épuré. Remplissez ceci seulement si vous voulez une ligne de texte au-dessus.",
  "editor.welcomeLine": "Ligne de bienvenue",
  "editor.blessingOrVerse": "Bénédiction ou vers",
  "editor.attribution": "Attribution",
  "editor.theDay": "Le jour",
  "editor.occasion": "Occasion",
  "editor.dateAndTime": "Date et heure",
  "editor.venue": "Lieu",
  "editor.googleMapsLink": "Lien Google Maps",
  "editor.mapsHint":
    "Facultatif — laissez vide et toucher le nom du lieu lancera automatiquement une recherche Google Maps. Collez un lien ici seulement si vous voulez envoyer les invités vers un point précis.",
  "editor.yourFunctions": "Vos événements",
  "editor.addFunction": "Ajouter un événement",
  "editor.replies": "Réponses",
  "editor.whatsappNumber": "Numéro WhatsApp",
  "editor.replyBy": "Répondre avant le",
  "editor.yourHashtag": "Votre hashtag",
  "editor.travelStay": "Voyage et séjour",
  "editor.gettingThere": "Comment s'y rendre",
  "editor.whereToStay": "Où séjourner",
  "editor.goodToKnow": "Bon à savoir",
  "editor.music": "Musique",
  "editor.photos": "Photos",
  "editor.yourStory": "Votre histoire",
  "editor.lineForGuests": "Une ligne pour vos invités",
  "editor.togetherSince": "Ensemble depuis",
  "editor.replayOpening": "Revoir l'ouverture",
  "editor.previewNote":
    "Ceci est un aperçu en direct — chaque modification à gauche apparaît ici instantanément. Laissez un champ vide et il est simplement omis de votre invitation ; aucune ligne vide ni texte de remplacement n'apparaît jamais. Des photos d'exemple peuvent apparaître dans les emplacements photo vides, dans cet aperçu uniquement — les invités voient ces emplacements vides jusqu'à ce que vous ajoutiez vos propres photos.",
  "collection.eyebrow": "La collection",
  "collection.heading": "{count} fa\u00e7ons de dire",
  "collection.headingEm": "r\u00e9servez la date",
  "collection.sub":
    "Chaque design est une exp\u00e9rience anim\u00e9e compl\u00e8te \u2014 du premier geste au compte \u00e0 rebours final.",
  "collection.seeAll": "Voir les {count} designs",
  "how.eyebrow": "Comment \u00e7a marche",
  "how.heading": "Pr\u00eat en une",
  "how.headingEm": "soir\u00e9e",
  "steps.1.title": "Choisissez un design",
  "steps.1.body":
    "Parcourez {count} invitations anim\u00e9es \u2014 royales, modernes, florales, destination. Pr\u00e9visualisez chacune exactement comme vos invit\u00e9s la verront.",
  "steps.2.title": "Personnalisez, gratuitement",
  "steps.2.body":
    "Ajoutez vos noms, dates, lieux, chaque \u00e9v\u00e9nement de la c\u00e9r\u00e9monie du henn\u00e9 \u00e0 la r\u00e9ception, vos photos et votre musique. Modifiez autant de fois que vous le souhaitez.",
  "steps.3.title": "Payez une fois, partagez",
  "steps.3.body":
    "Publiez pour \u20b9599 et obtenez votre propre lien. Envoyez-le sur WhatsApp, Instagram, n'importe o\u00f9 \u2014 il s'ouvre magnifiquement sur n'importe quel t\u00e9l\u00e9phone.",
  "compare.eyebrow": "Pourquoi choisir le num\u00e9rique",
  "compare.heading": "Papier",
  "compare.headingEm": "contre",
  "compare.headingSuffix": "num\u00e9rique",
  "compare.colFeature": "Caract\u00e9ristique",
  "compare.colPaper": "Papier",
  "compare.colDigital": "Num\u00e9rique",
  "compare.row.cost.feature": "Co\u00fbt",
  "compare.row.cost.paper": "\u20b9150\u2013\u20b9500+ par carte, plus l'impression",
  "compare.row.cost.digital": "\u20b9599 une fois",
  "compare.row.delivery.feature": "D\u00e9lai de livraison",
  "compare.row.delivery.paper": "1\u20132 semaines d'impression et de livraison",
  "compare.row.delivery.digital": "Instantan\u00e9",
  "compare.row.animation.feature": "Animation d'ouverture",
  "compare.row.music.feature": "Musique de fond",
  "compare.row.countdown.feature": "Compte \u00e0 rebours en direct",
  "compare.row.editable.feature": "Modifiable apr\u00e8s l'envoi",
  "compare.row.maps.feature": "Itin\u00e9raire Google Maps",
  "compare.row.guests.feature": "Invit\u00e9s et partages illimit\u00e9s",
  "compare.row.whatsapp.feature": "Partageable sur WhatsApp",
  "pricing.eyebrow": "Tarif",
  "pricing.heading1": "Un seul prix.",
  "pricing.heading2": "Aucun abonnement.",
  "pricing.body":
    "Concevez et pr\u00e9visualisez aussi longtemps que vous le souhaitez, sans frais. Payez seulement quand vous \u00eates pr\u00eat \u00e0 la partager avec le monde.",
  "pricing.theInvitation": "L'invitation",
  "pricing.oneTime": "paiement unique",
  "pricing.startCustomising": "Commencer \u00e0 personnaliser \u2014 gratuit",
  "included.0": "N'importe lequel de nos {count} designs anim\u00e9s",
  "included.1":
    "\u00c9v\u00e9nements illimit\u00e9s \u2014 du henn\u00e9 \u00e0 la r\u00e9ception",
  "included.2": "Galerie photo, musique et compte \u00e0 rebours en direct",
  "included.3": "Itin\u00e9raire Google Maps pour chaque lieu",
  "included.4": "Invit\u00e9s illimit\u00e9s, partages illimit\u00e9s",
  "included.5": "Modifiez les d\u00e9tails \u00e0 tout moment apr\u00e8s la publication",
  "faq.eyebrow": "Questions",
  "faq.heading": "Avant de",
  "faq.headingEm": "commencer",
  "faq.q0": "Est-ce vraiment gratuit de concevoir ?",
  "faq.a0":
    "Oui. Choisissez n'importe quel design, ajoutez vos noms, dates et lieux, et prévisualisez le tout sur votre propre téléphone — entièrement gratuit. Ajouter vos propres photos ou votre musique demande simplement un compte gratuit. Vous ne payez que lorsque vous choisissez de publier.",
  "faq.q1": "\u00c0 quoi servent r\u00e9ellement les \u20b9599 ?",
  "faq.a1":
    "Une invitation, publi\u00e9e une fois, avec son propre lien partageable \u2014 pas de filigrane, pas d'abonnement, pas de frais par invit\u00e9. Vous pouvez continuer \u00e0 la modifier apr\u00e8s publication, jusqu'au mariage.",
  "faq.q2":
    "Puis-je ajouter la c\u00e9r\u00e9monie du henn\u00e9, le sangeet et la r\u00e9ception s\u00e9par\u00e9ment ?",
  "faq.a2":
    "Oui \u2014 ajoutez autant d'\u00e9v\u00e9nements que vous le souhaitez, chacun avec sa propre date, heure, lieu et code vestimentaire, le tout dans un seul lien d'invitation.",
  "faq.q3": "Cela fonctionnera-t-il pour les invit\u00e9s qui ne sont pas sur WhatsApp ?",
  "faq.a3":
    "Le lien est une page web normale, donc il s'ouvre de la m\u00eame fa\u00e7on par SMS, Instagram, e-mail ou toute autre application \u2014 WhatsApp n'est que le moyen le plus simple de l'envoyer.",
  "faq.q4": "Puis-je modifier les d\u00e9tails apr\u00e8s avoir partag\u00e9 le lien ?",
  "faq.a4":
    "Oui. Modifiez les noms, dates, lieux ou photos \u00e0 tout moment avant votre \u00e9v\u00e9nement \u2014 le lien reste le m\u00eame, donc les invit\u00e9s voient toujours la derni\u00e8re version.",
  "faq.q5": "Pourquoi \u20b9599 ?",
  "faq.a5":
    "Cela couvre le co\u00fbt de l'h\u00e9bergement de votre invitation et du traitement du paiement lui-m\u00eame \u2014 les serveurs et une passerelle de paiement facturent tous deux par invitation. Nous n'essayons pas de gagner beaucoup plus que cela ; nous pr\u00e9f\u00e9rons que vous ayez une belle invitation plut\u00f4t qu'une gratuite qui dispara\u00eet en un mois.",
  "faq.q6": "Puis-je utiliser mes propres photos et musique ?",
  "faq.a6":
    "Oui. T\u00e9l\u00e9chargez vos propres photographies pour la galerie, et choisissez un morceau de notre biblioth\u00e8que ou t\u00e9l\u00e9chargez votre propre chanson \u2014 les t\u00e9l\u00e9chargements sont enregistr\u00e9s dans votre compte, donc ils sont l\u00e0 lorsque vous publiez. Un seul mod\u00e8le, Dubai Silk, est livr\u00e9 avec sa propre musique de th\u00e8me ; les autres mod\u00e8les restent silencieux jusqu'\u00e0 ce que vous choisissiez une musique.",
  "faq.q7":
    "Y a-t-il une limite au nombre d'invit\u00e9s ou au nombre de fois o\u00f9 le lien est ouvert ?",
  "faq.a7":
    "Non. Partagez votre lien avec autant d'invit\u00e9s que vous le souhaitez, sur n'importe quel nombre de groupes \u2014 il n'y a pas de limite d'invit\u00e9s ni de limite de vues.",
  "faq.q8": "Les invit\u00e9s doivent-ils installer quelque chose ou s'inscrire ?",
  "faq.a8":
    "Non. Le lien s'ouvre directement dans le navigateur de leur t\u00e9l\u00e9phone \u2014 pas d'application, pas de compte, rien \u00e0 installer.",
  "faq.q9":
    "Que faire si je ne suis pas satisfait(e) de son apparence apr\u00e8s la publication ?",
  "faq.a9":
    "Vous pouvez continuer \u00e0 modifier une invitation publi\u00e9e sans frais suppl\u00e9mentaires. Si quelque chose est r\u00e9ellement cass\u00e9, consultez notre politique de remboursement \u2014 nous le r\u00e9parerons ou vous rembourserons.",
  "faq.q10": "Puis-je obtenir de l'aide si je suis bloqu\u00e9(e) ?",
  "faq.a10":
    "Oui \u2014 contactez-nous \u00e0 tout moment depuis notre page de contact et nous vous aiderons \u00e0 pr\u00e9parer votre invitation.",
  "closing.shubhVivah": "Shubh Vivah",
  "closing.heading": "Commencez par un",
  "closing.headingEm": "beau",
  "closing.headingSuffix": "bonjour.",
  "closing.createYours": "Cr\u00e9ez la v\u00f4tre",
};

const de: Partial<Dictionary> = {
  "nav.designs": "Designs",
  "nav.howItWorks": "So funktioniert's",
  "nav.pricing": "Preise",
  "nav.faq": "FAQ",
  "nav.createYours": "Erstelle deine",
  "nav.signIn": "Anmelden",
  "nav.dashboard": "Dashboard",
  "nav.signOut": "Abmelden",
  "nav.openMenu": "Menü öffnen",
  "nav.closeMenu": "Menü schließen",
  "nav.primaryLabel": "Hauptnavigation",
  "footer.tagline":
    "Animierte Hochzeitseinladungen für das Handy jedes Gastes. Es werden keine physischen Produkte verschickt.",
  "footer.explore": "Entdecken",
  "footer.policies": "Richtlinien",
  "footer.terms": "AGB",
  "footer.privacy": "Datenschutz",
  "footer.refunds": "Rückerstattungen",
  "footer.contact": "Kontakt",
  "footer.copy": "Mit Liebe gemacht, für die Liebe.",
  "hero.eyebrow": "Digitale Hochzeitseinladungen",
  "hero.titleLine1": "Eine Einladung",
  "hero.titleOpenPrefix": "die man ",
  "hero.titleOpen": "zweimal öffnet",
  "hero.titleLine3": "",
  "hero.lede":
    "Umschläge, die sich öffnen, Palasttüren, die sich teilen, ein Datum, das unter Goldfolie enthüllt wird. Deine eigene persönliche Webseite für deinen großen Tag — geteilt in einem WhatsApp-Link.",
  "hero.browseDesigns": "{count} Designs ansehen",
  "hero.noteStrong": "Unbegrenzte Anpassung",
  "hero.noteRest": "immer kostenlos",
  "theme.preview": "Vorschau",
  "theme.useDesign": "Dieses Design verwenden",
  "editor.design": "Design",
  "editor.yourNames": "Eure Namen",
  "editor.name": "Name",
  "editor.partnersName": "Name des Partners",
  "editor.families": "Familien",
  "editor.familiesNote":
    "Indische Einladungen nennen die Eltern; leer lassen, um es wegzulassen.",
  "editor.firstSide": "Erste Seite",
  "editor.secondSide": "Zweite Seite",
  "editor.parents": "Eltern",
  "editor.grandparents": "Großeltern",
  "editor.qualifications": "Qualifikationen",
  "editor.openingText": "Eröffnungstext",
  "editor.openingTextHint":
    "Optional — die meisten Einladungen gehen direkt vom Hauptbild zu den Namen über, was am saubersten wirkt. Fülle dies nur aus, wenn du eine Textzeile darüber möchtest.",
  "editor.welcomeLine": "Begrüßungszeile",
  "editor.blessingOrVerse": "Segen oder Vers",
  "editor.attribution": "Zuschreibung",
  "editor.theDay": "Der Tag",
  "editor.occasion": "Anlass",
  "editor.dateAndTime": "Datum und Uhrzeit",
  "editor.venue": "Ort",
  "editor.googleMapsLink": "Google-Maps-Link",
  "editor.mapsHint":
    "Optional — leer lassen, dann wird beim Tippen auf den Ortsnamen automatisch bei Google Maps gesucht. Füge hier nur einen Link ein, wenn Gäste zu einem bestimmten Pin geleitet werden sollen.",
  "editor.yourFunctions": "Eure Veranstaltungen",
  "editor.addFunction": "Veranstaltung hinzufügen",
  "editor.replies": "Antworten",
  "editor.whatsappNumber": "WhatsApp-Nummer",
  "editor.replyBy": "Antwort bis",
  "editor.yourHashtag": "Euer Hashtag",
  "editor.travelStay": "Anreise & Unterkunft",
  "editor.gettingThere": "Anreise",
  "editor.whereToStay": "Unterkunft",
  "editor.goodToKnow": "Gut zu wissen",
  "editor.music": "Musik",
  "editor.photos": "Fotos",
  "editor.yourStory": "Eure Geschichte",
  "editor.lineForGuests": "Eine Zeile für eure Gäste",
  "editor.togetherSince": "Zusammen seit",
  "editor.replayOpening": "Eröffnung erneut ansehen",
  "editor.previewNote":
    "Dies ist eine Live-Vorschau — jede Änderung links wird hier sofort angezeigt. Lässt du ein Feld leer, wird es einfach aus deiner Einladung weggelassen; es erscheinen nie leere Zeilen oder Platzhaltertext. Beispielfotos können nur in dieser Vorschau in leeren Fotoplätzen erscheinen — Gäste sehen diese Plätze leer, bis du deine eigenen Fotos hinzufügst.",
  "collection.eyebrow": "Die Kollektion",
  "collection.heading": "{count} Wege zu sagen",
  "collection.headingEm": "Rettet das Datum",
  "collection.sub":
    "Jedes Design ist ein vollst\u00e4ndiges animiertes Erlebnis \u2014 vom ersten Antippen bis zum letzten Countdown.",
  "collection.seeAll": "Alle {count} Designs ansehen",
  "how.eyebrow": "So funktioniert's",
  "how.heading": "Fertig an einem",
  "how.headingEm": "Abend",
  "steps.1.title": "Design ausw\u00e4hlen",
  "steps.1.body":
    "Durchst\u00f6bern Sie {count} animierte Einladungen \u2014 k\u00f6niglich, modern, floral, Destination. Sehen Sie jede genau so, wie Ihre G\u00e4ste sie sehen werden.",
  "steps.2.title": "Kostenlos anpassen",
  "steps.2.body":
    "F\u00fcgen Sie Namen, Daten, Veranstaltungsorte, jede Feier von Haldi bis zum Empfang, Ihre Fotos und Musik hinzu. Bearbeiten Sie so oft Sie m\u00f6chten.",
  "steps.3.title": "Einmal zahlen, teilen",
  "steps.3.body":
    "Ver\u00f6ffentlichen Sie f\u00fcr \u20b9599 und erhalten Sie Ihren eigenen Link. Senden Sie ihn \u00fcber WhatsApp, Instagram, \u00fcberallhin \u2014 er \u00f6ffnet sich wundersch\u00f6n auf jedem Telefon.",
  "compare.eyebrow": "Warum digital w\u00e4hlen",
  "compare.heading": "Papier",
  "compare.headingEm": "gegen",
  "compare.headingSuffix": "digital",
  "compare.colFeature": "Merkmal",
  "compare.colPaper": "Papier",
  "compare.colDigital": "Digital",
  "compare.row.cost.feature": "Kosten",
  "compare.row.cost.paper": "\u20b9150\u2013\u20b9500+ pro Karte, zuz\u00fcglich Druck",
  "compare.row.cost.digital": "\u20b9599 einmalig",
  "compare.row.delivery.feature": "Lieferzeit",
  "compare.row.delivery.paper": "1\u20132 Wochen Druck & Versand",
  "compare.row.delivery.digital": "Sofort",
  "compare.row.animation.feature": "Er\u00f6ffnungsanimation",
  "compare.row.music.feature": "Hintergrundmusik",
  "compare.row.countdown.feature": "Live-Countdown",
  "compare.row.editable.feature": "Nach dem Versand bearbeitbar",
  "compare.row.maps.feature": "Google Maps Wegbeschreibung",
  "compare.row.guests.feature": "Unbegrenzte G\u00e4ste & Shares",
  "compare.row.whatsapp.feature": "\u00dcber WhatsApp teilbar",
  "pricing.eyebrow": "Preise",
  "pricing.heading1": "Ein Preis.",
  "pricing.heading2": "Kein Abonnement.",
  "pricing.body":
    "Gestalten und schauen Sie sich die Vorschau an, so lange Sie m\u00f6chten, kostenlos. Zahlen Sie erst, wenn Sie bereit sind, sie mit der Welt zu teilen.",
  "pricing.theInvitation": "Die Einladung",
  "pricing.oneTime": "einmalig",
  "pricing.startCustomising": "Kostenlos anpassen beginnen",
  "included.0": "Eines unserer {count} animierten Designs",
  "included.1": "Unbegrenzte Feiern \u2014 von Haldi bis zum Empfang",
  "included.2": "Fotogalerie, Musik & Live-Countdown",
  "included.3": "Google Maps Wegbeschreibung f\u00fcr jeden Ort",
  "included.4": "Unbegrenzte G\u00e4ste, unbegrenzte Shares",
  "included.5": "Details jederzeit nach der Ver\u00f6ffentlichung bearbeiten",
  "faq.eyebrow": "Fragen",
  "faq.heading": "Bevor Sie",
  "faq.headingEm": "beginnen",
  "faq.q0": "Ist das Gestalten wirklich kostenlos?",
  "faq.a0":
    "Ja. Wählen Sie ein beliebiges Design, fügen Sie Ihre Namen, Daten und Veranstaltungsorte hinzu und schauen Sie sich alles auf Ihrem eigenen Telefon an — alles kostenlos. Um Ihre eigenen Fotos oder Ihre Musik hinzuzufügen, brauchen Sie nur ein kostenloses Konto. Sie zahlen erst, wenn Sie sich zur Veröffentlichung entscheiden.",
  "faq.q1": "Wof\u00fcr wird mit den \u20b9599 eigentlich bezahlt?",
  "faq.a1":
    "Eine Einladung, einmal ver\u00f6ffentlicht, mit eigenem teilbarem Link \u2014 kein Wasserzeichen, kein Abonnement, keine Geb\u00fchr pro Gast. Sie k\u00f6nnen sie nach der Ver\u00f6ffentlichung bis zur Hochzeit weiter bearbeiten.",
  "faq.q2": "Kann ich Haldi, Sangeet und Empfang separat hinzuf\u00fcgen?",
  "faq.a2":
    "Ja \u2014 f\u00fcgen Sie so viele Feiern hinzu, wie Sie m\u00f6chten, jede mit eigenem Datum, Uhrzeit, Ort und Kleiderordnung, alles in einem einzigen Einladungslink.",
  "faq.q3": "Funktioniert das f\u00fcr G\u00e4ste, die nicht bei WhatsApp sind?",
  "faq.a3":
    "Der Link ist eine normale Webseite, sodass er \u00fcber SMS, Instagram, E-Mail oder jede andere App genauso ge\u00f6ffnet wird \u2014 WhatsApp ist nur der einfachste Weg, ihn zu senden.",
  "faq.q4": "Kann ich Details \u00e4ndern, nachdem ich den Link geteilt habe?",
  "faq.a4":
    "Ja. Bearbeiten Sie Namen, Daten, Veranstaltungsorte oder Fotos jederzeit vor Ihrer Veranstaltung \u2014 der Link bleibt gleich, sodass G\u00e4ste immer die neueste Version sehen.",
  "faq.q5": "Warum \u20b9599?",
  "faq.a5":
    "Das deckt die Kosten f\u00fcr das Hosting Ihrer Einladung und die Zahlungsabwicklung selbst \u2014 Server und ein Zahlungsgateway berechnen beide pro Einladung. Wir versuchen nicht, dar\u00fcber hinaus viel zu verdienen; wir m\u00f6chten lieber, dass Sie eine sch\u00f6ne Einladung haben, statt einer kostenlosen, die in einem Monat verschwindet.",
  "faq.q6": "Kann ich meine eigenen Fotos und Musik verwenden?",
  "faq.a6":
    "Ja. Laden Sie Ihre eigenen Fotos f\u00fcr die Galerie hoch und w\u00e4hlen Sie entweder einen Titel aus unserer Bibliothek oder laden Sie Ihren eigenen Song hoch \u2014 Uploads werden in Ihrem Konto gespeichert, sodass sie da sind, wenn Sie ver\u00f6ffentlichen. Ein Design, Dubai Silk, wird bereits mit einem eigenen Themen-Track geliefert; die anderen Designs bleiben stumm, bis Sie Musik ausw\u00e4hlen.",
  "faq.q7":
    "Gibt es eine Begrenzung f\u00fcr G\u00e4ste oder wie oft der Link ge\u00f6ffnet wird?",
  "faq.a7":
    "Nein. Teilen Sie Ihren Link mit so vielen G\u00e4sten, wie Sie m\u00f6chten, in beliebig vielen Gruppen \u2014 es gibt keine G\u00e4steobergrenze und keine Aufruflimit.",
  "faq.q8": "M\u00fcssen G\u00e4ste etwas installieren oder sich anmelden?",
  "faq.a8":
    "Nein. Der Link \u00f6ffnet sich direkt im Browser ihres Telefons \u2014 keine App, kein Konto, nichts zu installieren.",
  "faq.q9":
    "Was, wenn mir das Aussehen nach der Ver\u00f6ffentlichung nicht gef\u00e4llt?",
  "faq.a9":
    "Sie k\u00f6nnen eine ver\u00f6ffentlichte Einladung ohne zus\u00e4tzliche Kosten weiter bearbeiten. Falls wirklich etwas kaputt ist, lesen Sie unsere R\u00fcckerstattungsrichtlinie \u2014 wir reparieren es oder erstatten Ihnen den Betrag.",
  "faq.q10": "Kann ich Hilfe bekommen, wenn ich nicht weiterkomme?",
  "faq.a10":
    "Ja \u2014 kontaktieren Sie uns jederzeit \u00fcber unsere Kontaktseite, und wir helfen Ihnen, Ihre Einladung fertigzustellen.",
  "closing.shubhVivah": "Shubh Vivah",
  "closing.heading": "Beginnen Sie mit einem",
  "closing.headingEm": "wundersch\u00f6nen",
  "closing.headingSuffix": "Hallo.",
  "closing.createYours": "Erstellen Sie Ihre",
};

const es: Partial<Dictionary> = {
  "nav.designs": "Diseños",
  "nav.howItWorks": "Cómo funciona",
  "nav.pricing": "Precios",
  "nav.faq": "Preguntas frecuentes",
  "nav.createYours": "Crea la tuya",
  "nav.signIn": "Iniciar sesión",
  "nav.dashboard": "Panel",
  "nav.signOut": "Cerrar sesión",
  "nav.openMenu": "Abrir menú",
  "nav.closeMenu": "Cerrar menú",
  "nav.primaryLabel": "Principal",
  "footer.tagline":
    "Invitaciones de boda animadas para el teléfono de cada invitado. No se envía ningún producto físico.",
  "footer.explore": "Explorar",
  "footer.policies": "Políticas",
  "footer.terms": "Términos",
  "footer.privacy": "Privacidad",
  "footer.refunds": "Reembolsos",
  "footer.contact": "Contacto",
  "footer.copy": "Hecho con amor, para el amor.",
  "hero.eyebrow": "Invitaciones de boda digitales",
  "hero.titleLine1": "Una invitación",
  "hero.titleOpenPrefix": "que ",
  "hero.titleOpen": "abrirán dos veces",
  "hero.titleLine3": "",
  "hero.lede":
    "Sobres que se abren, puertas de palacio que se separan, una fecha revelada bajo papel dorado. Tu propia página personalizada para tu gran día — compartida en un enlace de WhatsApp.",
  "hero.browseDesigns": "Explorar {count} diseños",
  "hero.noteStrong": "Personalización ilimitada",
  "hero.noteRest": "siempre gratis",
  "theme.preview": "Vista previa",
  "theme.useDesign": "Usar este diseño",
  "editor.design": "Diseño",
  "editor.yourNames": "Vuestros nombres",
  "editor.name": "Nombre",
  "editor.partnersName": "Nombre de la pareja",
  "editor.families": "Familias",
  "editor.familiesNote":
    "Las invitaciones indias mencionan a los padres; déjalo en blanco para omitirlo.",
  "editor.firstSide": "Primer lado",
  "editor.secondSide": "Segundo lado",
  "editor.parents": "Padres",
  "editor.grandparents": "Abuelos",
  "editor.qualifications": "Cualificaciones",
  "editor.openingText": "Texto de apertura",
  "editor.openingTextHint":
    "Opcional — la mayoría de las invitaciones pasan directamente de la imagen principal a los nombres, lo cual se ve más limpio. Completa esto solo si quieres una línea de texto encima.",
  "editor.welcomeLine": "Línea de bienvenida",
  "editor.blessingOrVerse": "Bendición o verso",
  "editor.attribution": "Atribución",
  "editor.theDay": "El día",
  "editor.occasion": "Ocasión",
  "editor.dateAndTime": "Fecha y hora",
  "editor.venue": "Lugar",
  "editor.googleMapsLink": "Enlace de Google Maps",
  "editor.mapsHint":
    "Opcional — déjalo en blanco y al tocar el nombre del lugar se buscará automáticamente en Google Maps. Pega un enlace aquí solo si quieres enviar a los invitados a un punto específico.",
  "editor.yourFunctions": "Vuestros eventos",
  "editor.addFunction": "Añadir evento",
  "editor.replies": "Respuestas",
  "editor.whatsappNumber": "Número de WhatsApp",
  "editor.replyBy": "Responder antes del",
  "editor.yourHashtag": "Vuestro hashtag",
  "editor.travelStay": "Viaje y alojamiento",
  "editor.gettingThere": "Cómo llegar",
  "editor.whereToStay": "Dónde alojarse",
  "editor.goodToKnow": "Bueno saber",
  "editor.music": "Música",
  "editor.photos": "Fotos",
  "editor.yourStory": "Vuestra historia",
  "editor.lineForGuests": "Una línea para vuestros invitados",
  "editor.togetherSince": "Juntos desde",
  "editor.replayOpening": "Repetir la apertura",
  "editor.previewNote":
    "Esta es una vista previa en vivo — cada cambio a la izquierda aparece aquí al instante. Si dejas un campo en blanco, simplemente se omite de tu invitación; nunca aparecen líneas vacías ni texto de marcador de posición. Pueden aparecer fotos de muestra en los espacios de fotos vacíos solo en esta vista previa — los invitados ven esos espacios vacíos hasta que añadas tus propias fotos.",
  "collection.eyebrow": "La colecci\u00f3n",
  "collection.heading": "{count} formas de decir",
  "collection.headingEm": "guarda la fecha",
  "collection.sub":
    "Cada dise\u00f1o es una experiencia animada completa \u2014 desde el primer toque hasta la cuenta regresiva final.",
  "collection.seeAll": "Ver los {count} dise\u00f1os",
  "how.eyebrow": "C\u00f3mo funciona",
  "how.heading": "Listo en una",
  "how.headingEm": "noche",
  "steps.1.title": "Elige un dise\u00f1o",
  "steps.1.body":
    "Explora {count} invitaciones animadas \u2014 reales, modernas, florales, de destino. Previsualiza cada una exactamente como la ver\u00e1n tus invitados.",
  "steps.2.title": "Personaliza, gratis",
  "steps.2.body":
    "A\u00f1ade vuestros nombres, fechas, lugares, cada evento desde el haldi hasta la recepci\u00f3n, vuestras fotos y m\u00fasica. Edita tantas veces como quieras.",
  "steps.3.title": "Paga una vez, comparte",
  "steps.3.body":
    "Publica por \u20b9599 y obt\u00e9n tu propio enlace. Env\u00edalo por WhatsApp, Instagram, donde sea \u2014 se abre maravillosamente en cualquier tel\u00e9fono.",
  "compare.eyebrow": "Por qu\u00e9 elegir lo digital",
  "compare.heading": "Papel",
  "compare.headingEm": "frente a",
  "compare.headingSuffix": "digital",
  "compare.colFeature": "Caracter\u00edstica",
  "compare.colPaper": "Papel",
  "compare.colDigital": "Digital",
  "compare.row.cost.feature": "Costo",
  "compare.row.cost.paper":
    "\u20b9150\u2013\u20b9500+ por tarjeta, m\u00e1s impresi\u00f3n",
  "compare.row.cost.digital": "\u20b9599 pago \u00fanico",
  "compare.row.delivery.feature": "Tiempo de entrega",
  "compare.row.delivery.paper": "1\u20132 semanas de impresi\u00f3n y env\u00edo",
  "compare.row.delivery.digital": "Instant\u00e1neo",
  "compare.row.animation.feature": "Animaci\u00f3n de apertura",
  "compare.row.music.feature": "M\u00fasica de fondo",
  "compare.row.countdown.feature": "Cuenta regresiva en vivo",
  "compare.row.editable.feature": "Editable despu\u00e9s de enviar",
  "compare.row.maps.feature": "Indicaciones de Google Maps",
  "compare.row.guests.feature": "Invitados y comparticiones ilimitados",
  "compare.row.whatsapp.feature": "Compartible por WhatsApp",
  "pricing.eyebrow": "Precio",
  "pricing.heading1": "Un solo precio.",
  "pricing.heading2": "Sin suscripci\u00f3n.",
  "pricing.body":
    "Dise\u00f1a y previsualiza todo el tiempo que quieras sin costo. Paga solo cuando est\u00e9s listo para compartirla con el mundo.",
  "pricing.theInvitation": "La invitaci\u00f3n",
  "pricing.oneTime": "pago \u00fanico",
  "pricing.startCustomising": "Empieza a personalizar \u2014 gratis",
  "included.0": "Cualquiera de nuestros {count} dise\u00f1os animados",
  "included.1": "Eventos ilimitados \u2014 del haldi a la recepci\u00f3n",
  "included.2": "Galer\u00eda de fotos, m\u00fasica y cuenta regresiva en vivo",
  "included.3": "Indicaciones de Google Maps para cada lugar",
  "included.4": "Invitados ilimitados, comparticiones ilimitadas",
  "included.5": "Edita los detalles en cualquier momento despu\u00e9s de publicar",
  "faq.eyebrow": "Preguntas",
  "faq.heading": "Antes de",
  "faq.headingEm": "empezar",
  "faq.q0": "\u00bfEs realmente gratis dise\u00f1ar?",
  "faq.a0":
    "Sí. Elige cualquier diseño, añade vuestros nombres, fechas y lugares, y previsualiza todo en tu propio teléfono — totalmente gratis. Para añadir tus propias fotos o música solo necesitas una cuenta gratuita. Solo pagas cuando decides publicar.",
  "faq.q1": "\u00bfPara qu\u00e9 se usan realmente los \u20b9599?",
  "faq.a1":
    "Una invitaci\u00f3n, publicada una vez, con su propio enlace compartible \u2014 sin marca de agua, sin suscripci\u00f3n, sin cargo por invitado. Puedes seguir edit\u00e1ndola despu\u00e9s de publicarla, hasta la boda.",
  "faq.q2":
    "\u00bfPuedo a\u00f1adir el haldi, el sangeet y la recepci\u00f3n por separado?",
  "faq.a2":
    "S\u00ed \u2014 a\u00f1ade tantos eventos como quieras, cada uno con su propia fecha, hora, lugar y c\u00f3digo de vestimenta, todo dentro de un solo enlace de invitaci\u00f3n.",
  "faq.q3": "\u00bfFuncionar\u00e1 para invitados que no tienen WhatsApp?",
  "faq.a3":
    "El enlace es una p\u00e1gina web normal, as\u00ed que se abre igual por SMS, Instagram, correo electr\u00f3nico o cualquier otra aplicaci\u00f3n \u2014 WhatsApp es solo la forma m\u00e1s f\u00e1cil de enviarlo.",
  "faq.q4": "\u00bfPuedo cambiar los detalles despu\u00e9s de compartir el enlace?",
  "faq.a4":
    "S\u00ed. Edita nombres, fechas, lugares o fotos en cualquier momento antes de tu evento \u2014 el enlace sigue siendo el mismo, as\u00ed que los invitados siempre ven la versi\u00f3n m\u00e1s reciente.",
  "faq.q5": "\u00bfPor qu\u00e9 \u20b9599?",
  "faq.a5":
    "Eso cubre el costo de alojar tu invitaci\u00f3n y procesar el pago en s\u00ed \u2014 tanto los servidores como una pasarela de pago cobran por invitaci\u00f3n. No intentamos ganar mucho m\u00e1s que eso; preferimos que tengas una invitaci\u00f3n hermosa en lugar de una gratuita que desaparece en un mes.",
  "faq.q6": "\u00bfPuedo usar mis propias fotos y m\u00fasica?",
  "faq.a6":
    "S\u00ed. Sube tus propias fotograf\u00edas para la galer\u00eda, y elige una pista de nuestra biblioteca o sube tu propia canci\u00f3n \u2014 las subidas se guardan en tu cuenta, as\u00ed que est\u00e1n ah\u00ed cuando publicas. Un dise\u00f1o, Dubai Silk, viene con su propia pista tem\u00e1tica; los dem\u00e1s dise\u00f1os permanecen en silencio hasta que elijas m\u00fasica.",
  "faq.q7":
    "\u00bfHay un l\u00edmite de invitados o de cu\u00e1ntas veces se abre el enlace?",
  "faq.a7":
    "No. Comparte tu enlace con tantos invitados como quieras, en cualquier n\u00famero de grupos \u2014 no hay l\u00edmite de invitados ni l\u00edmite de visualizaciones.",
  "faq.q8": "\u00bfLos invitados necesitan instalar algo o registrarse?",
  "faq.a8":
    "No. El enlace se abre directamente en el navegador de su tel\u00e9fono \u2014 sin aplicaci\u00f3n, sin cuenta, nada que instalar.",
  "faq.q9":
    "\u00bfQu\u00e9 pasa si no me gusta c\u00f3mo se ve despu\u00e9s de publicar?",
  "faq.a9":
    "Puedes seguir editando una invitaci\u00f3n publicada sin costo adicional. Si algo est\u00e1 realmente da\u00f1ado, consulta nuestra pol\u00edtica de reembolso \u2014 lo arreglaremos o te reembolsaremos.",
  "faq.q10": "\u00bfPuedo obtener ayuda si me quedo atascado/a?",
  "faq.a10":
    "S\u00ed \u2014 cont\u00e1ctanos en cualquier momento desde nuestra p\u00e1gina de contacto y te ayudaremos a preparar tu invitaci\u00f3n.",
  "closing.shubhVivah": "Shubh Vivah",
  "closing.heading": "Empieza con un",
  "closing.headingEm": "hermoso",
  "closing.headingSuffix": "hola.",
  "closing.createYours": "Crea la tuya",
};

const pt: Partial<Dictionary> = {
  "nav.designs": "Modelos",
  "nav.howItWorks": "Como funciona",
  "nav.pricing": "Preços",
  "nav.faq": "Perguntas frequentes",
  "nav.createYours": "Crie o seu",
  "nav.signIn": "Entrar",
  "nav.dashboard": "Painel",
  "nav.signOut": "Sair",
  "nav.openMenu": "Abrir menu",
  "nav.closeMenu": "Fechar menu",
  "nav.primaryLabel": "Principal",
  "footer.tagline":
    "Convites de casamento animados para o telefone de cada convidado. Nenhum produto físico é enviado.",
  "footer.explore": "Explorar",
  "footer.policies": "Políticas",
  "footer.terms": "Termos",
  "footer.privacy": "Privacidade",
  "footer.refunds": "Reembolsos",
  "footer.contact": "Contato",
  "footer.copy": "Feito com amor, para o amor.",
  "hero.eyebrow": "Convites de casamento digitais",
  "hero.titleLine1": "Um convite",
  "hero.titleOpenPrefix": "que ",
  "hero.titleOpen": "abrirão duas vezes",
  "hero.titleLine3": "",
  "hero.lede":
    "Envelopes que se abrem, portas de palácio que se separam, uma data revelada sob papel dourado. Sua própria página personalizada para o seu grande dia — compartilhada em um link do WhatsApp.",
  "hero.browseDesigns": "Ver {count} modelos",
  "hero.noteStrong": "Personalização ilimitada",
  "hero.noteRest": "sempre grátis",
  "theme.preview": "Pré-visualização",
  "theme.useDesign": "Usar este design",
  "editor.design": "Design",
  "editor.yourNames": "Seus nomes",
  "editor.name": "Nome",
  "editor.partnersName": "Nome do parceiro",
  "editor.families": "Famílias",
  "editor.familiesNote":
    "Convites indianos mencionam os pais; deixe em branco para omitir.",
  "editor.firstSide": "Primeiro lado",
  "editor.secondSide": "Segundo lado",
  "editor.parents": "Pais",
  "editor.grandparents": "Avós",
  "editor.qualifications": "Qualificações",
  "editor.openingText": "Texto de abertura",
  "editor.openingTextHint":
    "Opcional — a maioria dos convites vai direto da imagem principal para os nomes, o que fica mais limpo. Preencha isso apenas se quiser uma linha de texto acima deles.",
  "editor.welcomeLine": "Linha de boas-vindas",
  "editor.blessingOrVerse": "Bênção ou verso",
  "editor.attribution": "Atribuição",
  "editor.theDay": "O dia",
  "editor.occasion": "Ocasião",
  "editor.dateAndTime": "Data e hora",
  "editor.venue": "Local",
  "editor.googleMapsLink": "Link do Google Maps",
  "editor.mapsHint":
    "Opcional — deixe em branco e tocar no nome do local buscará automaticamente no Google Maps. Cole um link aqui apenas se quiser enviar os convidados para um ponto específico.",
  "editor.yourFunctions": "Seus eventos",
  "editor.addFunction": "Adicionar evento",
  "editor.replies": "Respostas",
  "editor.whatsappNumber": "Número do WhatsApp",
  "editor.replyBy": "Responder até",
  "editor.yourHashtag": "Sua hashtag",
  "editor.travelStay": "Viagem e hospedagem",
  "editor.gettingThere": "Como chegar",
  "editor.whereToStay": "Onde ficar",
  "editor.goodToKnow": "Bom saber",
  "editor.music": "Música",
  "editor.photos": "Fotos",
  "editor.yourStory": "Sua história",
  "editor.lineForGuests": "Uma linha para seus convidados",
  "editor.togetherSince": "Juntos desde",
  "editor.replayOpening": "Reassistir a abertura",
  "editor.previewNote":
    "Esta é uma prévia ao vivo — cada alteração à esquerda aparece aqui instantaneamente. Deixe um campo em branco e ele simplesmente é omitido do seu convite; nunca aparecem linhas vazias ou texto de espaço reservado. Fotos de exemplo podem aparecer nos espaços de fotos vazios apenas nesta prévia — os convidados veem esses espaços vazios até você adicionar suas próprias fotos.",
  "collection.eyebrow": "A cole\u00e7\u00e3o",
  "collection.heading": "{count} formas de dizer",
  "collection.headingEm": "guarde a data",
  "collection.sub":
    "Cada design \u00e9 uma experi\u00eancia animada completa \u2014 do primeiro toque \u00e0 contagem regressiva final.",
  "collection.seeAll": "Ver todos os {count} designs",
  "how.eyebrow": "Como funciona",
  "how.heading": "Pronto em uma",
  "how.headingEm": "noite",
  "steps.1.title": "Escolha um design",
  "steps.1.body":
    "Explore {count} convites animados \u2014 reais, modernos, florais, de destino. Visualize cada um exatamente como seus convidados ver\u00e3o.",
  "steps.2.title": "Personalize, gr\u00e1tis",
  "steps.2.body":
    "Adicione seus nomes, datas, locais, cada evento do haldi \u00e0 recep\u00e7\u00e3o, suas fotos e m\u00fasica. Edite quantas vezes quiser.",
  "steps.3.title": "Pague uma vez, compartilhe",
  "steps.3.body":
    "Publique por \u20b9599 e obtenha seu pr\u00f3prio link. Envie-o pelo WhatsApp, Instagram, qualquer lugar \u2014 ele abre lindamente em qualquer telefone.",
  "compare.eyebrow": "Por que escolher o digital",
  "compare.heading": "Papel",
  "compare.headingEm": "versus",
  "compare.headingSuffix": "digital",
  "compare.colFeature": "Recurso",
  "compare.colPaper": "Papel",
  "compare.colDigital": "Digital",
  "compare.row.cost.feature": "Custo",
  "compare.row.cost.paper":
    "\u20b9150\u2013\u20b9500+ por cart\u00e3o, mais impress\u00e3o",
  "compare.row.cost.digital": "\u20b9599 pagamento \u00fanico",
  "compare.row.delivery.feature": "Prazo de entrega",
  "compare.row.delivery.paper": "1\u20132 semanas de impress\u00e3o e envio",
  "compare.row.delivery.digital": "Instant\u00e2neo",
  "compare.row.animation.feature": "Anima\u00e7\u00e3o de abertura",
  "compare.row.music.feature": "M\u00fasica de fundo",
  "compare.row.countdown.feature": "Contagem regressiva ao vivo",
  "compare.row.editable.feature": "Edit\u00e1vel ap\u00f3s o envio",
  "compare.row.maps.feature": "Dire\u00e7\u00f5es do Google Maps",
  "compare.row.guests.feature": "Convidados e compartilhamentos ilimitados",
  "compare.row.whatsapp.feature": "Compartilh\u00e1vel no WhatsApp",
  "pricing.eyebrow": "Pre\u00e7o",
  "pricing.heading1": "Um \u00fanico pre\u00e7o.",
  "pricing.heading2": "Sem assinatura.",
  "pricing.body":
    "Crie e visualize pelo tempo que quiser, sem custo. Pague apenas quando estiver pronto para compartilhar com o mundo.",
  "pricing.theInvitation": "O convite",
  "pricing.oneTime": "pagamento \u00fanico",
  "pricing.startCustomising": "Comece a personalizar \u2014 gr\u00e1tis",
  "included.0": "Qualquer um dos nossos {count} designs animados",
  "included.1": "Eventos ilimitados \u2014 do haldi \u00e0 recep\u00e7\u00e3o",
  "included.2": "Galeria de fotos, m\u00fasica e contagem regressiva ao vivo",
  "included.3": "Dire\u00e7\u00f5es do Google Maps para cada local",
  "included.4": "Convidados ilimitados, compartilhamentos ilimitados",
  "included.5": "Edite os detalhes a qualquer momento ap\u00f3s a publica\u00e7\u00e3o",
  "faq.eyebrow": "Perguntas",
  "faq.heading": "Antes de",
  "faq.headingEm": "come\u00e7ar",
  "faq.q0": "\u00c9 realmente gr\u00e1tis criar o design?",
  "faq.a0":
    "Sim. Escolha qualquer design, adicione seus nomes, datas e locais, e visualize tudo no seu próprio telefone — totalmente grátis. Adicionar suas próprias fotos ou música só precisa de uma conta gratuita. Você só paga quando decide publicar.",
  "faq.q1": "Para que servem realmente os \u20b9599?",
  "faq.a1":
    "Um convite, publicado uma vez, com seu pr\u00f3prio link compartilh\u00e1vel \u2014 sem marca d'\u00e1gua, sem assinatura, sem cobran\u00e7a por convidado. Voc\u00ea pode continuar editando depois de publicar, at\u00e9 o casamento.",
  "faq.q2": "Posso adicionar haldi, sangeet e recep\u00e7\u00e3o separadamente?",
  "faq.a2":
    "Sim \u2014 adicione quantos eventos quiser, cada um com sua pr\u00f3pria data, hor\u00e1rio, local e c\u00f3digo de vestimenta, tudo dentro de um \u00fanico link de convite.",
  "faq.q3": "Vai funcionar para convidados que n\u00e3o t\u00eam WhatsApp?",
  "faq.a3":
    "O link \u00e9 uma p\u00e1gina da web normal, ent\u00e3o abre da mesma forma via SMS, Instagram, e-mail ou qualquer outro aplicativo \u2014 o WhatsApp \u00e9 apenas a forma mais f\u00e1cil de envi\u00e1-lo.",
  "faq.q4": "Posso alterar detalhes depois de compartilhar o link?",
  "faq.a4":
    "Sim. Edite nomes, datas, locais ou fotos a qualquer momento antes do seu evento \u2014 o link permanece o mesmo, ent\u00e3o os convidados sempre veem a vers\u00e3o mais recente.",
  "faq.q5": "Por que \u20b9599?",
  "faq.a5":
    "Isso cobre o custo de hospedar seu convite e processar o pr\u00f3prio pagamento \u2014 tanto os servidores quanto um gateway de pagamento cobram por convite. N\u00e3o estamos tentando lucrar muito al\u00e9m disso; preferimos que voc\u00ea tenha um convite bonito em vez de um gratuito que desaparece em um m\u00eas.",
  "faq.q6": "Posso usar minhas pr\u00f3prias fotos e m\u00fasicas?",
  "faq.a6":
    "Sim. Envie suas pr\u00f3prias fotografias para a galeria, e escolha uma faixa da nossa biblioteca ou envie sua pr\u00f3pria m\u00fasica \u2014 os envios s\u00e3o salvos na sua conta, ent\u00e3o est\u00e3o l\u00e1 quando voc\u00ea publicar. Um design, Dubai Silk, j\u00e1 vem com sua pr\u00f3pria trilha tem\u00e1tica; os demais designs ficam em sil\u00eancio at\u00e9 voc\u00ea escolher uma m\u00fasica.",
  "faq.q7": "H\u00e1 um limite de convidados ou de quantas vezes o link \u00e9 aberto?",
  "faq.a7":
    "N\u00e3o. Compartilhe seu link com quantos convidados quiser, em qualquer n\u00famero de grupos \u2014 n\u00e3o h\u00e1 limite de convidados nem limite de visualiza\u00e7\u00f5es.",
  "faq.q8": "Os convidados precisam instalar algo ou se cadastrar?",
  "faq.a8":
    "N\u00e3o. O link abre diretamente no navegador do telefone deles \u2014 sem aplicativo, sem conta, nada para instalar.",
  "faq.q9": "E se eu n\u00e3o gostar da apar\u00eancia depois de publicar?",
  "faq.a9":
    "Voc\u00ea pode continuar editando um convite publicado sem custo adicional. Se algo estiver realmente quebrado, consulte nossa pol\u00edtica de reembolso \u2014 n\u00f3s consertaremos ou reembolsaremos voc\u00ea.",
  "faq.q10": "Posso obter ajuda se ficar preso/a?",
  "faq.a10":
    "Sim \u2014 entre em contato conosco a qualquer momento pela nossa p\u00e1gina de contato e ajudaremos voc\u00ea a preparar seu convite.",
  "closing.shubhVivah": "Shubh Vivah",
  "closing.heading": "Comece com um",
  "closing.headingEm": "lindo",
  "closing.headingSuffix": "ol\u00e1.",
  "closing.createYours": "Crie o seu",
};

const ru: Partial<Dictionary> = {
  "nav.designs": "Дизайны",
  "nav.howItWorks": "Как это работает",
  "nav.pricing": "Цены",
  "nav.faq": "Частые вопросы",
  "nav.createYours": "Создать своё",
  "nav.signIn": "Войти",
  "nav.dashboard": "Панель",
  "nav.signOut": "Выйти",
  "nav.openMenu": "Открыть меню",
  "nav.closeMenu": "Закрыть меню",
  "nav.primaryLabel": "Основная",
  "footer.tagline":
    "Анимированные свадебные приглашения для телефона каждого гостя. Физические товары не отправляются.",
  "footer.explore": "Обзор",
  "footer.policies": "Политики",
  "footer.terms": "Условия",
  "footer.privacy": "Конфиденциальность",
  "footer.refunds": "Возвраты",
  "footer.contact": "Контакты",
  "footer.copy": "Сделано с любовью, во имя любви.",
  "hero.eyebrow": "Цифровые свадебные приглашения",
  "hero.titleLine1": "Приглашение,",
  "hero.titleOpenPrefix": "которое ",
  "hero.titleOpen": "откроют дважды",
  "hero.titleLine3": "",
  "hero.lede":
    "Конверты, которые распечатываются, дворцовые двери, которые раскрываются, дата, скрытая под золотой фольгой. Ваша собственная персональная веб-страница для важного дня — делитесь одной ссылкой в WhatsApp.",
  "hero.browseDesigns": "Посмотреть {count} дизайнов",
  "hero.noteStrong": "Неограниченная настройка",
  "hero.noteRest": "всегда бесплатно",
  "theme.preview": "Предпросмотр",
  "theme.useDesign": "Использовать этот дизайн",
  "editor.design": "Дизайн",
  "editor.yourNames": "Ваши имена",
  "editor.name": "Имя",
  "editor.partnersName": "Имя партнёра",
  "editor.families": "Семьи",
  "editor.familiesNote":
    "В индийских приглашениях указываются родители; оставьте пустым, чтобы пропустить.",
  "editor.firstSide": "Первая сторона",
  "editor.secondSide": "Вторая сторона",
  "editor.parents": "Родители",
  "editor.grandparents": "Бабушка и дедушка",
  "editor.qualifications": "Квалификация",
  "editor.openingText": "Вступительный текст",
  "editor.openingTextHint":
    "Необязательно — большинство приглашений переходят прямо от главного изображения к именам, что выглядит чище всего. Заполните это, только если хотите строку текста над именами.",
  "editor.welcomeLine": "Приветственная строка",
  "editor.blessingOrVerse": "Благословение или стих",
  "editor.attribution": "Автор",
  "editor.theDay": "День",
  "editor.occasion": "Повод",
  "editor.dateAndTime": "Дата и время",
  "editor.venue": "Место проведения",
  "editor.googleMapsLink": "Ссылка на Google Maps",
  "editor.mapsHint":
    "Необязательно — оставьте пустым, и нажатие на название места автоматически запустит поиск в Google Maps. Вставляйте ссылку здесь, только если хотите отправить гостей на конкретную точку.",
  "editor.yourFunctions": "Ваши мероприятия",
  "editor.addFunction": "Добавить мероприятие",
  "editor.replies": "Ответы",
  "editor.whatsappNumber": "Номер WhatsApp",
  "editor.replyBy": "Ответить до",
  "editor.yourHashtag": "Ваш хэштег",
  "editor.travelStay": "Поездка и проживание",
  "editor.gettingThere": "Как добраться",
  "editor.whereToStay": "Где остановиться",
  "editor.goodToKnow": "Полезно знать",
  "editor.music": "Музыка",
  "editor.photos": "Фото",
  "editor.yourStory": "Ваша история",
  "editor.lineForGuests": "Строка для гостей",
  "editor.togetherSince": "Вместе с",
  "editor.replayOpening": "Посмотреть открытие снова",
  "editor.previewNote":
    "Это живой предпросмотр — каждое изменение слева мгновенно отображается здесь. Оставьте поле пустым, и оно просто не попадёт в приглашение; пустые строки или текст-заполнитель никогда не отображаются. Образцы фотографий могут появляться в пустых местах для фото только в этом предпросмотре — гости видят эти места пустыми, пока вы не добавите свои фотографии.",
  "collection.eyebrow": "\u041a\u043e\u043b\u043b\u0435\u043a\u0446\u0438\u044f",
  "collection.heading":
    "{count} \u0441\u043f\u043e\u0441\u043e\u0431\u043e\u0432 \u0441\u043a\u0430\u0437\u0430\u0442\u044c",
  "collection.headingEm":
    "\u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u0435 \u0434\u0430\u0442\u0443",
  "collection.sub":
    "\u041a\u0430\u0436\u0434\u044b\u0439 \u0434\u0438\u0437\u0430\u0439\u043d \u2014 \u044d\u0442\u043e \u043f\u043e\u043b\u043d\u043e\u0446\u0435\u043d\u043d\u044b\u0439 \u0430\u043d\u0438\u043c\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u0439 \u043e\u043f\u044b\u0442: \u043e\u0442 \u043f\u0435\u0440\u0432\u043e\u0433\u043e \u043a\u0430\u0441\u0430\u043d\u0438\u044f \u0434\u043e \u0444\u0438\u043d\u0430\u043b\u044c\u043d\u043e\u0433\u043e \u043e\u0431\u0440\u0430\u0442\u043d\u043e\u0433\u043e \u043e\u0442\u0441\u0447\u0451\u0442\u0430.",
  "collection.seeAll":
    "\u0421\u043c\u043e\u0442\u0440\u0435\u0442\u044c \u0432\u0441\u0435 {count} \u0434\u0438\u0437\u0430\u0439\u043d\u043e\u0432",
  "how.eyebrow":
    "\u041a\u0430\u043a \u044d\u0442\u043e \u0440\u0430\u0431\u043e\u0442\u0430\u0435\u0442",
  "how.heading":
    "\u0413\u043e\u0442\u043e\u0432\u043e \u0437\u0430 \u043e\u0434\u0438\u043d",
  "how.headingEm": "\u0432\u0435\u0447\u0435\u0440",
  "steps.1.title":
    "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0438\u0437\u0430\u0439\u043d",
  "steps.1.body":
    "\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0438\u0442\u0435 {count} \u0430\u043d\u0438\u043c\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u0445 \u043f\u0440\u0438\u0433\u043b\u0430\u0448\u0435\u043d\u0438\u0439 \u2014 \u043a\u043e\u0440\u043e\u043b\u0435\u0432\u0441\u043a\u0438\u0435, \u0441\u043e\u0432\u0440\u0435\u043c\u0435\u043d\u043d\u044b\u0435, \u0446\u0432\u0435\u0442\u043e\u0447\u043d\u044b\u0435, \u0434\u043b\u044f \u043f\u0443\u0442\u0435\u0448\u0435\u0441\u0442\u0432\u0438\u0439. \u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0438\u0442\u0435 \u043a\u0430\u0436\u0434\u043e\u0435 \u0438\u043c\u0435\u043d\u043d\u043e \u0442\u0430\u043a, \u043a\u0430\u043a \u0435\u0433\u043e \u0443\u0432\u0438\u0434\u044f\u0442 \u0432\u0430\u0448\u0438 \u0433\u043e\u0441\u0442\u0438.",
  "steps.2.title":
    "\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u0442\u0435 \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e",
  "steps.2.body":
    "\u0414\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u0438\u043c\u0435\u043d\u0430, \u0434\u0430\u0442\u044b, \u043c\u0435\u0441\u0442\u0430 \u043f\u0440\u043e\u0432\u0435\u0434\u0435\u043d\u0438\u044f, \u043a\u0430\u0436\u0434\u043e\u0435 \u0441\u043e\u0431\u044b\u0442\u0438\u0435 \u043e\u0442 \u0445\u0430\u043b\u044c\u0434\u0438 \u0434\u043e \u043f\u0440\u0438\u0451\u043c\u0430, \u0432\u0430\u0448\u0438 \u0444\u043e\u0442\u043e \u0438 \u043c\u0443\u0437\u044b\u043a\u0443. \u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u0443\u0439\u0442\u0435 \u0441\u043a\u043e\u043b\u044c\u043a\u043e \u0443\u0433\u043e\u0434\u043d\u043e \u0440\u0430\u0437.",
  "steps.3.title":
    "\u0417\u0430\u043f\u043b\u0430\u0442\u0438\u0442\u0435 \u043e\u0434\u0438\u043d \u0440\u0430\u0437, \u043f\u043e\u0434\u0435\u043b\u0438\u0442\u0435\u0441\u044c",
  "steps.3.body":
    "\u041e\u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0439\u0442\u0435 \u0437\u0430 \u20b9599 \u0438 \u043f\u043e\u043b\u0443\u0447\u0438\u0442\u0435 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u043d\u0443\u044e \u0441\u0441\u044b\u043b\u043a\u0443. \u041e\u0442\u043f\u0440\u0430\u0432\u044c\u0442\u0435 \u0435\u0451 \u0432 WhatsApp, Instagram, \u043a\u0443\u0434\u0430 \u0443\u0433\u043e\u0434\u043d\u043e \u2014 \u043e\u043d\u0430 \u043a\u0440\u0430\u0441\u0438\u0432\u043e \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u043d\u0430 \u043b\u044e\u0431\u043e\u043c \u0442\u0435\u043b\u0435\u0444\u043e\u043d\u0435.",
  "compare.eyebrow":
    "\u041f\u043e\u0447\u0435\u043c\u0443 \u0441\u0442\u043e\u0438\u0442 \u0432\u044b\u0431\u0440\u0430\u0442\u044c \u0446\u0438\u0444\u0440\u043e\u0432\u043e\u0439 \u0444\u043e\u0440\u043c\u0430\u0442",
  "compare.heading": "\u0411\u0443\u043c\u0430\u0433\u0430",
  "compare.headingEm": "\u043f\u0440\u043e\u0442\u0438\u0432",
  "compare.headingSuffix": "\u0446\u0438\u0444\u0440\u0430",
  "compare.colFeature":
    "\u041e\u0441\u043e\u0431\u0435\u043d\u043d\u043e\u0441\u0442\u044c",
  "compare.colPaper": "\u0411\u0443\u043c\u0430\u0433\u0430",
  "compare.colDigital": "\u0426\u0438\u0444\u0440\u0430",
  "compare.row.cost.feature": "\u0421\u0442\u043e\u0438\u043c\u043e\u0441\u0442\u044c",
  "compare.row.cost.paper":
    "\u20b9150\u2013\u20b9500+ \u0437\u0430 \u043e\u0442\u043a\u0440\u044b\u0442\u043a\u0443, \u043f\u043b\u044e\u0441 \u043f\u0435\u0447\u0430\u0442\u044c",
  "compare.row.cost.digital":
    "\u20b9599 \u0435\u0434\u0438\u043d\u043e\u0440\u0430\u0437\u043e\u0432\u043e",
  "compare.row.delivery.feature":
    "\u0421\u0440\u043e\u043a \u0434\u043e\u0441\u0442\u0430\u0432\u043a\u0438",
  "compare.row.delivery.paper":
    "1\u20132 \u043d\u0435\u0434\u0435\u043b\u0438 \u043f\u0435\u0447\u0430\u0442\u0438 \u0438 \u0434\u043e\u0441\u0442\u0430\u0432\u043a\u0438",
  "compare.row.delivery.digital":
    "\u041c\u0433\u043d\u043e\u0432\u0435\u043d\u043d\u043e",
  "compare.row.animation.feature":
    "\u0410\u043d\u0438\u043c\u0430\u0446\u0438\u044f \u043e\u0442\u043a\u0440\u044b\u0442\u0438\u044f",
  "compare.row.music.feature":
    "\u0424\u043e\u043d\u043e\u0432\u0430\u044f \u043c\u0443\u0437\u044b\u043a\u0430",
  "compare.row.countdown.feature":
    "\u041e\u0431\u0440\u0430\u0442\u043d\u044b\u0439 \u043e\u0442\u0441\u0447\u0451\u0442 \u0432 \u0440\u0435\u0430\u043b\u044c\u043d\u043e\u043c \u0432\u0440\u0435\u043c\u0435\u043d\u0438",
  "compare.row.editable.feature":
    "\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u0443\u0435\u0442\u0441\u044f \u043f\u043e\u0441\u043b\u0435 \u043e\u0442\u043f\u0440\u0430\u0432\u043a\u0438",
  "compare.row.maps.feature":
    "\u041c\u0430\u0440\u0448\u0440\u0443\u0442 \u0432 Google Maps",
  "compare.row.guests.feature":
    "\u041d\u0435\u043e\u0433\u0440\u0430\u043d\u0438\u0447\u0435\u043d\u043d\u043e\u0435 \u0447\u0438\u0441\u043b\u043e \u0433\u043e\u0441\u0442\u0435\u0439 \u0438 \u0440\u0435\u043f\u043e\u0441\u0442\u043e\u0432",
  "compare.row.whatsapp.feature":
    "\u041c\u043e\u0436\u043d\u043e \u043f\u043e\u0434\u0435\u043b\u0438\u0442\u044c\u0441\u044f \u0432 WhatsApp",
  "pricing.eyebrow": "\u0426\u0435\u043d\u0430",
  "pricing.heading1": "\u0415\u0434\u0438\u043d\u0430\u044f \u0446\u0435\u043d\u0430.",
  "pricing.heading2":
    "\u0411\u0435\u0437 \u043f\u043e\u0434\u043f\u0438\u0441\u043a\u0438.",
  "pricing.body":
    "\u0421\u043e\u0437\u0434\u0430\u0432\u0430\u0439\u0442\u0435 \u0438 \u043f\u0440\u043e\u0441\u043c\u0430\u0442\u0440\u0438\u0432\u0430\u0439\u0442\u0435 \u0441\u043a\u043e\u043b\u044c\u043a\u043e \u0443\u0433\u043e\u0434\u043d\u043e \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e. \u041f\u043b\u0430\u0442\u0438\u0442\u0435 \u0442\u043e\u043b\u044c\u043a\u043e \u0442\u043e\u0433\u0434\u0430, \u043a\u043e\u0433\u0434\u0430 \u0431\u0443\u0434\u0435\u0442\u0435 \u0433\u043e\u0442\u043e\u0432\u044b \u043f\u043e\u0434\u0435\u043b\u0438\u0442\u044c\u0441\u044f \u0438\u043c \u0441 \u043c\u0438\u0440\u043e\u043c.",
  "pricing.theInvitation":
    "\u041f\u0440\u0438\u0433\u043b\u0430\u0448\u0435\u043d\u0438\u0435",
  "pricing.oneTime": "\u0435\u0434\u0438\u043d\u043e\u0440\u0430\u0437\u043e\u0432\u043e",
  "pricing.startCustomising":
    "\u041d\u0430\u0447\u0430\u0442\u044c \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0443 \u2014 \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e",
  "included.0":
    "\u041b\u044e\u0431\u043e\u0439 \u0438\u0437 \u043d\u0430\u0448\u0438\u0445 {count} \u0430\u043d\u0438\u043c\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u0445 \u0434\u0438\u0437\u0430\u0439\u043d\u043e\u0432",
  "included.1":
    "\u041d\u0435\u043e\u0433\u0440\u0430\u043d\u0438\u0447\u0435\u043d\u043d\u043e\u0435 \u0447\u0438\u0441\u043b\u043e \u0441\u043e\u0431\u044b\u0442\u0438\u0439 \u2014 \u043e\u0442 \u0445\u0430\u043b\u044c\u0434\u0438 \u0434\u043e \u043f\u0440\u0438\u0451\u043c\u0430",
  "included.2":
    "\u0424\u043e\u0442\u043e\u0433\u0430\u043b\u0435\u0440\u0435\u044f, \u043c\u0443\u0437\u044b\u043a\u0430 \u0438 \u043e\u0431\u0440\u0430\u0442\u043d\u044b\u0439 \u043e\u0442\u0441\u0447\u0451\u0442 \u0432 \u0440\u0435\u0430\u043b\u044c\u043d\u043e\u043c \u0432\u0440\u0435\u043c\u0435\u043d\u0438",
  "included.3":
    "\u041c\u0430\u0440\u0448\u0440\u0443\u0442 \u0432 Google Maps \u0434\u043b\u044f \u043a\u0430\u0436\u0434\u043e\u0433\u043e \u043c\u0435\u0441\u0442\u0430",
  "included.4":
    "\u041d\u0435\u043e\u0433\u0440\u0430\u043d\u0438\u0447\u0435\u043d\u043d\u043e\u0435 \u0447\u0438\u0441\u043b\u043e \u0433\u043e\u0441\u0442\u0435\u0439, \u043d\u0435\u043e\u0433\u0440\u0430\u043d\u0438\u0447\u0435\u043d\u043d\u043e\u0435 \u0447\u0438\u0441\u043b\u043e \u0440\u0435\u043f\u043e\u0441\u0442\u043e\u0432",
  "included.5":
    "\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u0443\u0439\u0442\u0435 \u0434\u0435\u0442\u0430\u043b\u0438 \u0432 \u043b\u044e\u0431\u043e\u0435 \u0432\u0440\u0435\u043c\u044f \u043f\u043e\u0441\u043b\u0435 \u043f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u0438",
  "faq.eyebrow": "\u0412\u043e\u043f\u0440\u043e\u0441\u044b",
  "faq.heading": "\u041f\u0440\u0435\u0436\u0434\u0435 \u0447\u0435\u043c",
  "faq.headingEm": "\u043d\u0430\u0447\u0430\u0442\u044c",
  "faq.q0":
    "\u042d\u0442\u043e \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u044c\u043d\u043e \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e \u2014 \u0441\u043e\u0437\u0434\u0430\u0432\u0430\u0442\u044c \u0434\u0438\u0437\u0430\u0439\u043d?",
  "faq.a0":
    "Да. Выберите любой дизайн, добавьте имена, даты и места проведения и просмотрите всё на своём телефоне — совершенно бесплатно. Чтобы добавить свои фотографии или музыку, нужен только бесплатный аккаунт. Вы платите только тогда, когда решите опубликовать.",
  "faq.q1":
    "\u0417\u0430 \u0447\u0442\u043e \u043d\u0430 \u0441\u0430\u043c\u043e\u043c \u0434\u0435\u043b\u0435 \u043f\u043b\u0430\u0442\u044f\u0442\u0441\u044f \u20b9599?",
  "faq.a1":
    "\u041e\u0434\u043d\u043e \u043f\u0440\u0438\u0433\u043b\u0430\u0448\u0435\u043d\u0438\u0435, \u043e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u043d\u043d\u043e\u0435 \u043e\u0434\u0438\u043d \u0440\u0430\u0437, \u0441\u043e \u0441\u0432\u043e\u0435\u0439 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u043d\u043e\u0439 \u0441\u0441\u044b\u043b\u043a\u043e\u0439 \u0434\u043b\u044f \u043e\u0442\u043f\u0440\u0430\u0432\u043a\u0438 \u2014 \u0431\u0435\u0437 \u0432\u043e\u0434\u044f\u043d\u044b\u0445 \u0437\u043d\u0430\u043a\u043e\u0432, \u0431\u0435\u0437 \u043f\u043e\u0434\u043f\u0438\u0441\u043a\u0438, \u0431\u0435\u0437 \u043f\u043b\u0430\u0442\u044b \u0437\u0430 \u0433\u043e\u0441\u0442\u044f. \u0412\u044b \u043c\u043e\u0436\u0435\u0442\u0435 \u043f\u0440\u043e\u0434\u043e\u043b\u0436\u0430\u0442\u044c \u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0435\u0433\u043e \u043f\u043e\u0441\u043b\u0435 \u043f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u0438 \u0432\u043f\u043b\u043e\u0442\u044c \u0434\u043e \u0441\u0432\u0430\u0434\u044c\u0431\u044b.",
  "faq.q2":
    "\u041c\u043e\u0433\u0443 \u043b\u0438 \u044f \u0434\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0445\u0430\u043b\u044c\u0434\u0438, \u0441\u0430\u043d\u0433\u0438\u0442 \u0438 \u043f\u0440\u0438\u0451\u043c \u043e\u0442\u0434\u0435\u043b\u044c\u043d\u043e?",
  "faq.a2":
    "\u0414\u0430 \u2014 \u0434\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u0441\u043a\u043e\u043b\u044c\u043a\u043e \u0443\u0433\u043e\u0434\u043d\u043e \u0441\u043e\u0431\u044b\u0442\u0438\u0439, \u043a\u0430\u0436\u0434\u043e\u0435 \u0441\u043e \u0441\u0432\u043e\u0435\u0439 \u0434\u0430\u0442\u043e\u0439, \u0432\u0440\u0435\u043c\u0435\u043d\u0435\u043c, \u043c\u0435\u0441\u0442\u043e\u043c \u0438 \u0434\u0440\u0435\u0441\u0441-\u043a\u043e\u0434\u043e\u043c, \u0432\u0441\u0451 \u0432 \u043e\u0434\u043d\u043e\u0439 \u0441\u0441\u044b\u043b\u043a\u0435 \u043d\u0430 \u043f\u0440\u0438\u0433\u043b\u0430\u0448\u0435\u043d\u0438\u0435.",
  "faq.q3":
    "\u0411\u0443\u0434\u0435\u0442 \u043b\u0438 \u044d\u0442\u043e \u0440\u0430\u0431\u043e\u0442\u0430\u0442\u044c \u0434\u043b\u044f \u0433\u043e\u0441\u0442\u0435\u0439, \u0443 \u043a\u043e\u0442\u043e\u0440\u044b\u0445 \u043d\u0435\u0442 WhatsApp?",
  "faq.a3":
    "\u0421\u0441\u044b\u043b\u043a\u0430 \u2014 \u044d\u0442\u043e \u043e\u0431\u044b\u0447\u043d\u0430\u044f \u0432\u0435\u0431-\u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430, \u043f\u043e\u044d\u0442\u043e\u043c\u0443 \u043e\u043d\u0430 \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u0442\u0430\u043a \u0436\u0435 \u0447\u0435\u0440\u0435\u0437 SMS, Instagram, \u044d\u043b\u0435\u043a\u0442\u0440\u043e\u043d\u043d\u0443\u044e \u043f\u043e\u0447\u0442\u0443 \u0438\u043b\u0438 \u043b\u044e\u0431\u043e\u0435 \u0434\u0440\u0443\u0433\u043e\u0435 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u2014 WhatsApp \u043f\u0440\u043e\u0441\u0442\u043e \u0441\u0430\u043c\u044b\u0439 \u043f\u0440\u043e\u0441\u0442\u043e\u0439 \u0441\u043f\u043e\u0441\u043e\u0431 \u0435\u0451 \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c.",
  "faq.q4":
    "\u041c\u043e\u0433\u0443 \u043b\u0438 \u044f \u0438\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u0434\u0435\u0442\u0430\u043b\u0438 \u043f\u043e\u0441\u043b\u0435 \u0442\u043e\u0433\u043e, \u043a\u0430\u043a \u043f\u043e\u0434\u0435\u043b\u0438\u043b\u0441\u044f \u0441\u0441\u044b\u043b\u043a\u043e\u0439?",
  "faq.a4":
    "\u0414\u0430. \u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u0443\u0439\u0442\u0435 \u0438\u043c\u0435\u043d\u0430, \u0434\u0430\u0442\u044b, \u043c\u0435\u0441\u0442\u0430 \u043f\u0440\u043e\u0432\u0435\u0434\u0435\u043d\u0438\u044f \u0438\u043b\u0438 \u0444\u043e\u0442\u043e \u0432 \u043b\u044e\u0431\u043e\u0435 \u0432\u0440\u0435\u043c\u044f \u0434\u043e \u0432\u0430\u0448\u0435\u0433\u043e \u0441\u043e\u0431\u044b\u0442\u0438\u044f \u2014 \u0441\u0441\u044b\u043b\u043a\u0430 \u043e\u0441\u0442\u0430\u0451\u0442\u0441\u044f \u043f\u0440\u0435\u0436\u043d\u0435\u0439, \u043f\u043e\u044d\u0442\u043e\u043c\u0443 \u0433\u043e\u0441\u0442\u0438 \u0432\u0441\u0435\u0433\u0434\u0430 \u0432\u0438\u0434\u044f\u0442 \u043f\u043e\u0441\u043b\u0435\u0434\u043d\u044e\u044e \u0432\u0435\u0440\u0441\u0438\u044e.",
  "faq.q5": "\u041f\u043e\u0447\u0435\u043c\u0443 \u20b9599?",
  "faq.a5":
    "\u042d\u0442\u043e \u043f\u043e\u043a\u0440\u044b\u0432\u0430\u0435\u0442 \u0440\u0430\u0441\u0445\u043e\u0434\u044b \u043d\u0430 \u0445\u043e\u0441\u0442\u0438\u043d\u0433 \u0432\u0430\u0448\u0435\u0433\u043e \u043f\u0440\u0438\u0433\u043b\u0430\u0448\u0435\u043d\u0438\u044f \u0438 \u043e\u0431\u0440\u0430\u0431\u043e\u0442\u043a\u0443 \u0441\u0430\u043c\u043e\u0433\u043e \u043f\u043b\u0430\u0442\u0435\u0436\u0430 \u2014 \u0438 \u0441\u0435\u0440\u0432\u0435\u0440\u044b, \u0438 \u043f\u043b\u0430\u0442\u0451\u0436\u043d\u044b\u0439 \u0448\u043b\u044e\u0437 \u0432\u0437\u0438\u043c\u0430\u044e\u0442 \u043f\u043b\u0430\u0442\u0443 \u0437\u0430 \u043a\u0430\u0436\u0434\u043e\u0435 \u043f\u0440\u0438\u0433\u043b\u0430\u0448\u0435\u043d\u0438\u0435. \u041c\u044b \u043d\u0435 \u043f\u044b\u0442\u0430\u0435\u043c\u0441\u044f \u0437\u0430\u0440\u0430\u0431\u043e\u0442\u0430\u0442\u044c \u043d\u0430 \u044d\u0442\u043e\u043c \u043d\u0430\u043c\u043d\u043e\u0433\u043e \u0431\u043e\u043b\u044c\u0448\u0435; \u043c\u044b \u043f\u0440\u043e\u0441\u0442\u043e \u0445\u043e\u0442\u0438\u043c, \u0447\u0442\u043e\u0431\u044b \u0443 \u0432\u0430\u0441 \u0431\u044b\u043b\u043e \u043a\u0440\u0430\u0441\u0438\u0432\u043e\u0435 \u043f\u0440\u0438\u0433\u043b\u0430\u0448\u0435\u043d\u0438\u0435, \u0430 \u043d\u0435 \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e\u0435, \u043a\u043e\u0442\u043e\u0440\u043e\u0435 \u0438\u0441\u0447\u0435\u0437\u043d\u0435\u0442 \u0447\u0435\u0440\u0435\u0437 \u043c\u0435\u0441\u044f\u0446.",
  "faq.q6":
    "\u041c\u043e\u0433\u0443 \u043b\u0438 \u044f \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u044c \u0441\u0432\u043e\u0438 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u043d\u044b\u0435 \u0444\u043e\u0442\u043e \u0438 \u043c\u0443\u0437\u044b\u043a\u0443?",
  "faq.a6":
    "\u0414\u0430. \u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u0441\u0432\u043e\u0438 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u043d\u044b\u0435 \u0444\u043e\u0442\u043e\u0433\u0440\u0430\u0444\u0438\u0438 \u0434\u043b\u044f \u0433\u0430\u043b\u0435\u0440\u0435\u0438 \u0438 \u043b\u0438\u0431\u043e \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0442\u0440\u0435\u043a \u0438\u0437 \u043d\u0430\u0448\u0435\u0439 \u0431\u0438\u0431\u043b\u0438\u043e\u0442\u0435\u043a\u0438, \u043b\u0438\u0431\u043e \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u0441\u0432\u043e\u044e \u043f\u0435\u0441\u043d\u044e \u2014 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0438 \u0441\u043e\u0445\u0440\u0430\u043d\u044f\u044e\u0442\u0441\u044f \u0432 \u0432\u0430\u0448\u0435\u043c \u0430\u043a\u043a\u0430\u0443\u043d\u0442\u0435, \u043f\u043e\u044d\u0442\u043e\u043c\u0443 \u043e\u043d\u0438 \u0431\u0443\u0434\u0443\u0442 \u043d\u0430 \u043c\u0435\u0441\u0442\u0435, \u043a\u043e\u0433\u0434\u0430 \u0432\u044b \u043e\u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0435\u0442\u0435. \u041e\u0434\u0438\u043d \u0434\u0438\u0437\u0430\u0439\u043d, Dubai Silk, \u0443\u0436\u0435 \u0438\u043c\u0435\u0435\u0442 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u043d\u0443\u044e \u0442\u0435\u043c\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u0443\u044e \u043c\u0443\u0437\u044b\u043a\u0443; \u043e\u0441\u0442\u0430\u043b\u044c\u043d\u044b\u0435 \u0434\u0438\u0437\u0430\u0439\u043d\u044b \u043e\u0441\u0442\u0430\u044e\u0442\u0441\u044f \u0431\u0435\u0437 \u0437\u0432\u0443\u043a\u0430, \u043f\u043e\u043a\u0430 \u0432\u044b \u043d\u0435 \u0432\u044b\u0431\u0435\u0440\u0435\u0442\u0435 \u043c\u0443\u0437\u044b\u043a\u0443.",
  "faq.q7":
    "\u0415\u0441\u0442\u044c \u043b\u0438 \u043e\u0433\u0440\u0430\u043d\u0438\u0447\u0435\u043d\u0438\u0435 \u043d\u0430 \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u0433\u043e\u0441\u0442\u0435\u0439 \u0438\u043b\u0438 \u043d\u0430 \u0442\u043e, \u0441\u043a\u043e\u043b\u044c\u043a\u043e \u0440\u0430\u0437 \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u0441\u0441\u044b\u043b\u043a\u0430?",
  "faq.a7":
    "\u041d\u0435\u0442. \u0414\u0435\u043b\u0438\u0442\u0435\u0441\u044c \u0441\u0432\u043e\u0435\u0439 \u0441\u0441\u044b\u043b\u043a\u043e\u0439 \u0441 \u043b\u044e\u0431\u044b\u043c \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e\u043c \u0433\u043e\u0441\u0442\u0435\u0439, \u0432 \u043b\u044e\u0431\u043e\u043c \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u0435 \u0433\u0440\u0443\u043f\u043f \u2014 \u043d\u0435\u0442 \u043d\u0438 \u043e\u0433\u0440\u0430\u043d\u0438\u0447\u0435\u043d\u0438\u044f \u043d\u0430 \u0447\u0438\u0441\u043b\u043e \u0433\u043e\u0441\u0442\u0435\u0439, \u043d\u0438 \u043e\u0433\u0440\u0430\u043d\u0438\u0447\u0435\u043d\u0438\u044f \u043d\u0430 \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u044b.",
  "faq.q8":
    "\u041d\u0443\u0436\u043d\u043e \u043b\u0438 \u0433\u043e\u0441\u0442\u044f\u043c \u0447\u0442\u043e-\u0442\u043e \u0443\u0441\u0442\u0430\u043d\u0430\u0432\u043b\u0438\u0432\u0430\u0442\u044c \u0438\u043b\u0438 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043e\u0432\u0430\u0442\u044c\u0441\u044f?",
  "faq.a8":
    "\u041d\u0435\u0442. \u0421\u0441\u044b\u043b\u043a\u0430 \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u043f\u0440\u044f\u043c\u043e \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435 \u0438\u0445 \u0442\u0435\u043b\u0435\u0444\u043e\u043d\u0430 \u2014 \u0431\u0435\u0437 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u044f, \u0431\u0435\u0437 \u0430\u043a\u043a\u0430\u0443\u043d\u0442\u0430, \u0431\u0435\u0437 \u0443\u0441\u0442\u0430\u043d\u043e\u0432\u043a\u0438 \u0447\u0435\u0433\u043e-\u043b\u0438\u0431\u043e.",
  "faq.q9":
    "\u0427\u0442\u043e, \u0435\u0441\u043b\u0438 \u043c\u043d\u0435 \u043d\u0435 \u043f\u043e\u043d\u0440\u0430\u0432\u0438\u0442\u0441\u044f, \u043a\u0430\u043a \u043e\u043d\u043e \u0432\u044b\u0433\u043b\u044f\u0434\u0438\u0442 \u043f\u043e\u0441\u043b\u0435 \u043f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u0438?",
  "faq.a9":
    "\u0412\u044b \u043c\u043e\u0436\u0435\u0442\u0435 \u043f\u0440\u043e\u0434\u043e\u043b\u0436\u0430\u0442\u044c \u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u043d\u043d\u043e\u0435 \u043f\u0440\u0438\u0433\u043b\u0430\u0448\u0435\u043d\u0438\u0435 \u0431\u0435\u0437 \u0434\u043e\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0445 \u0437\u0430\u0442\u0440\u0430\u0442. \u0415\u0441\u043b\u0438 \u0447\u0442\u043e-\u0442\u043e \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u044c\u043d\u043e \u0441\u043b\u043e\u043c\u0430\u043d\u043e, \u043e\u0437\u043d\u0430\u043a\u043e\u043c\u044c\u0442\u0435\u0441\u044c \u0441 \u043d\u0430\u0448\u0435\u0439 \u043f\u043e\u043b\u0438\u0442\u0438\u043a\u043e\u0439 \u0432\u043e\u0437\u0432\u0440\u0430\u0442\u0430 \u0441\u0440\u0435\u0434\u0441\u0442\u0432 \u2014 \u043c\u044b \u044d\u0442\u043e \u0438\u0441\u043f\u0440\u0430\u0432\u0438\u043c \u0438\u043b\u0438 \u0432\u0435\u0440\u043d\u0451\u043c \u0432\u0430\u043c \u0434\u0435\u043d\u044c\u0433\u0438.",
  "faq.q10":
    "\u041c\u043e\u0433\u0443 \u043b\u0438 \u044f \u043f\u043e\u043b\u0443\u0447\u0438\u0442\u044c \u043f\u043e\u043c\u043e\u0449\u044c, \u0435\u0441\u043b\u0438 \u0437\u0430\u0441\u0442\u0440\u044f\u043d\u0443?",
  "faq.a10":
    "\u0414\u0430 \u2014 \u0441\u0432\u044f\u0436\u0438\u0442\u0435\u0441\u044c \u0441 \u043d\u0430\u043c\u0438 \u0432 \u043b\u044e\u0431\u043e\u0435 \u0432\u0440\u0435\u043c\u044f \u0447\u0435\u0440\u0435\u0437 \u043d\u0430\u0448\u0443 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443 \u043a\u043e\u043d\u0442\u0430\u043a\u0442\u043e\u0432, \u0438 \u043c\u044b \u043f\u043e\u043c\u043e\u0436\u0435\u043c \u0432\u0430\u043c \u043f\u043e\u0434\u0433\u043e\u0442\u043e\u0432\u0438\u0442\u044c \u043f\u0440\u0438\u0433\u043b\u0430\u0448\u0435\u043d\u0438\u0435.",
  "closing.shubhVivah": "\u0428\u0443\u0431\u0445 \u0412\u0438\u0432\u0430\u0430\u0445",
  "closing.heading": "\u041d\u0430\u0447\u043d\u0438\u0442\u0435 \u0441",
  "closing.headingEm": "\u043a\u0440\u0430\u0441\u0438\u0432\u043e\u0433\u043e",
  "closing.headingSuffix":
    "\u043f\u0440\u0438\u0432\u0435\u0442\u0441\u0442\u0432\u0438\u044f.",
  "closing.createYours":
    "\u0421\u043e\u0437\u0434\u0430\u0439\u0442\u0435 \u0441\u0432\u043e\u0451",
};

export const dictionaries: Partial<Record<LocaleCode, Partial<Dictionary>>> = {
  en,
  hi,
  ar,
  mr,
  gu,
  bn,
  pa,
  ur,
  fr,
  de,
  es,
  pt,
  ru,
};

/** Falls back to English per-key, so a partially-translated language never shows blank. */
export function getDictionary(locale: LocaleCode): Dictionary {
  const found = dictionaries[locale];
  if (!found) return en;
  return { ...en, ...found };
}
