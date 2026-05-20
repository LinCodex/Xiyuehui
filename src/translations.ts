export type Lang = "en" | "cn" | "es";

export const getInitialLang = (): Lang => {
  if (typeof navigator !== "undefined") {
    const lang = navigator.language.toLowerCase();
    if (lang.startsWith("zh")) return "cn";
    if (lang.startsWith("es")) return "es";
  }
  return "en";
};

export const t = {
  en: {
    welcomeTitle1: "Share the",
    welcomeTitle2: "hotpot love.",
    startBtn: "Start",
    surveyFoodTitle: "How was the food?",
    surveyFoodSub: "Rate the broth, ingredients & seafood selection.",
    surveyServiceTitle: "How was the service?",
    surveyServiceSub: "From refills to clearing — how was the team?",
    surveyAtmoTitle: "How was the vibe?",
    surveyAtmoSub: "The atmosphere that made the meal memorable.",
    foodOptions: [
      { label: "Incredible", description: "Best AYCE hotpot — broth, seafood, everything." },
      { label: "Really Good", description: "Great selection and freshness, would return." },
      { label: "Solid", description: "Good hotpot, a reliable AYCE choice." }
    ],
    serviceOptions: [
      { label: "Top-Notch", description: "Fast, attentive, kept our table perfect." },
      { label: "Great", description: "Friendly and responsive to every need." },
      { label: "Good", description: "Helpful team, warm and welcoming." }
    ],
    atmoOptions: [
      { label: "Lively", description: "Buzzing energy, perfect for groups." },
      { label: "Cozy", description: "Warm and inviting, great for dates." },
      { label: "Chill", description: "Relaxed pace, no rush at all." }
    ],
    overallRating: "Overall Rating",
    overallSub: "How would you rate your visit?",
    ratingLabels: ["Needs Work", "Excellent"],
    qualityLabels: ["Needs Work", "Good", "Great", "Excellent", "Outstanding"],
    next: "Next",
    commentsTitle: "Anything else?",
    commentsSub: "A favorite dish, a standout moment, or a server who shined.",
    placeholder: "e.g., Don't miss out on the...",
    createBtn: "Create Review",
    suggestions: [
      "e.g., The spicy broth was incredibly flavorful and authentic...",
      "e.g., They had such a huge variety of fresh seafood and meats...",
      "e.g., The unlimited wagyu beef was absolutely worth it...",
      "e.g., Service was fast, they cleared plates and refilled soup constantly...",
      "e.g., Loved the DIY sauce bar, so many options to choose from...",
      "e.g., The ingredients were so fresh, especially the shrimp paste...",
      "e.g., The tomato broth was rich and perfect for drinking...",
      "e.g., Don't miss out on the free ice cream for dessert...",
      "e.g., Great atmosphere for a big group dinner with friends...",
    ],
    generatingTitle: "Crafting your review...",
    generatingSub: "Personalizing based on your feedback",
    errorTitle: "Oops, something went wrong.",
    errorSub: "There was an issue generating your review. This might be a temporary network error. Please ask our staff for help if this persists.",
    tryAgain: "Try Again",
    skipBtn: "Skip & Write Review Manually",
    resultTitle: "Your Review",
    copyBtn: "Copy to Clipboard",
    copiedBtn: "Copied!",
    refreshes: "Refreshes",
    limitReached: "Limit reached",
    regenerate: "Not quite right? Regenerate",
    postBtn: "Post to Google Maps",
    modalTitle: "Review Copied!",
    modalSubGoogle: "We're opening Google Maps for you. Simply paste your review in the comment box.",
    modalSubYelp: "We're opening Yelp for you. Simply paste your review in the comment box.",
    // TEAM_010: Update instruction to guide users to the "Text" tab to bypass native photo/video picker
    modalSubXiaohongshu: "We're opening Xiaohongshu. To post text, select the 'Text' (文字) tab at the bottom of the camera screen and paste your review.",
    modalSubInstagram: "We're opening Instagram for you. Simply paste your review into a new post or story.",
    modalGoGoogle: "Go to Google Maps",
    modalGoYelp: "Go to Yelp",
    modalGoXiaohongshu: "Go to Xiaohongshu",
    modalGoInstagram: "Go to Instagram",
    shareBtn: "Share Review"
  },
  cn: {
    welcomeTitle1: "分享火锅",
    welcomeTitle2: "好滋味。",
    startBtn: "开始",
    surveyFoodTitle: "食物如何？",
    surveyFoodSub: "锅底、食材和海鲜选择怎么样？",
    surveyServiceTitle: "服务如何？",
    surveyServiceSub: "从加汤到收盘，团队表现怎么样？",
    surveyAtmoTitle: "氛围如何？",
    surveyAtmoSub: "让美食更加难忘的用餐环境。",
    foodOptions: [
      { label: "太棒了", description: "最好的自助火锅，锅底海鲜都一流。" },
      { label: "非常好", description: "食材新鲜种类丰富，下次还来。" },
      { label: "不错", description: "好吃的火锅，値得一试。" }
    ],
    serviceOptions: [
      { label: "卓越", description: "迅速、贴心，服务周到。" },
      { label: "很好", description: "友善热情，有求必应。" },
      { label: "不错", description: "团队贴心，氛围轻松。" }
    ],
    atmoOptions: [
      { label: "超棒", description: "热闹有活力，适合聚餐。" },
      { label: "温馨", description: "温暖舒适，适合约会。" },
      { label: "放松", description: "节奏慢，悬然自得。" }
    ],
    overallRating: "总体评价",
    overallSub: "您这次的整体体验如何？",
    ratingLabels: ["有待提高", "极佳"],
    qualityLabels: ["有待提高", "不错", "很好", "优秀", "极佳"],
    next: "下一步",
    commentsTitle: "还有想说的吗？",
    commentsSub: "分享您特别喜欢的菜品或难忘的经历。",
    placeholder: "例如：千万别错过这里的...",
    createBtn: "生成评价",
    suggestions: [
      "例如：麻辣锅底醇厚正宗，辣得很过瘾...",
      "例如：海鲜和肉类的选择真的超级多，而且很新鲜...",
      "例如：和牛无限量供应，简直太划算了...",
      "例如：服务非常勤快，一直主动帮我们撇浮沫加汤...",
      "例如：自助小料台种类丰富，还可以自己调网红蘸料...",
      "例如：食材品质很高，特别是手工虾滑必点...",
      "例如：番茄锅浓郁鲜甜，喝了好几碗汤...",
      "例如：吃完火锅还有无限量的冰淇淋作为甜点...",
      "例如：餐厅空间很大，非常适合朋友聚餐...",
    ],
    generatingTitle: "正在定制您的评价...",
    generatingSub: "根据您的反馈个性化生成中",
    errorTitle: "哎呀，出错了。",
    errorSub: "生成评价时遇到问题，可能是暂时性的网络错误。如果问题仍然存在，请联系我们的工作人员。",
    tryAgain: "重试",
    skipBtn: "跳过并手动撰写评价",
    resultTitle: "您的评价",
    copyBtn: "复制到剪贴板",
    copiedBtn: "已复制！",
    refreshes: "重置次数",
    limitReached: "达到上限",
    regenerate: "不太满意？重新生成",
    postBtn: "发布到谷歌地图",
    modalTitle: "评价已复制！",
    modalSubGoogle: "正在为您打开谷歌地图。只需将评价粘贴到评论框中即可。",
    modalSubYelp: "正在为您打开 Yelp。只需将评价粘贴到评论框中即可。",
    // TEAM_010: Update instruction to guide users to the "Text" tab to bypass native photo/video picker
    modalSubXiaohongshu: "正在为您打开小红书。要发布纯文字，请在相机界面底部选择「文字」选项，然后粘贴您的评价。",
    modalSubInstagram: "正在为您打开 Instagram。只需将评价粘贴到新帖子或故事中即可。",
    modalGoGoogle: "前往谷歌地图",
    modalGoYelp: "前往 Yelp",
    modalGoXiaohongshu: "前往小红书",
    modalGoInstagram: "前往 Instagram",
    shareBtn: "分享评价"
  },
  es: {
    welcomeTitle1: "Comparte el",
    welcomeTitle2: "sabor hotpot.",
    startBtn: "Empezar",
    surveyFoodTitle: "¿Qué tal la comida?",
    surveyFoodSub: "Califica el caldo, ingredientes y selección de mariscos.",
    surveyServiceTitle: "¿Qué tal el servicio?",
    surveyServiceSub: "Desde rellenar hasta limpiar — ¿cómo fue el equipo?",
    surveyAtmoTitle: "¿Qué tal el ambiente?",
    surveyAtmoSub: "La atmósfera que hizo la comida memorable.",
    foodOptions: [
      { label: "Increíble", description: "El mejor AYCE hotpot — caldo, mariscos, todo." },
      { label: "Muy Bueno", description: "Gran selección y frescura, volvería." },
      { label: "Sólido", description: "Buen hotpot, una opción AYCE confiable." }
    ],
    serviceOptions: [
      { label: "De Primera", description: "Rápido, atento, mesa siempre perfecta." },
      { label: "Genial", description: "Amable y atento a cada necesidad." },
      { label: "Bueno", description: "Equipo servicial, cálido y acogedor." }
    ],
    atmoOptions: [
      { label: "Animado", description: "Energía vibrante, perfecto para grupos." },
      { label: "Acogedor", description: "Cálido e íntimo, ideal para citas." },
      { label: "Tranquilo", description: "Ritmo relajado, sin prisa alguna." }
    ],
    overallRating: "Calificación general",
    overallSub: "¿Cómo calificarías tu visita?",
    ratingLabels: ["Necesita mejorar", "Excelente"],
    qualityLabels: ["Necesita mejorar", "Bueno", "Muy bueno", "Excelente", "Excepcional"],
    next: "Siguiente",
    commentsTitle: "¿Algo más?",
    commentsSub: "Un plato favorito, un momento especial o un mesero destacado.",
    placeholder: "ej., No te pierdas el...",
    createBtn: "Crear reseña",
    suggestions: [
      "ej., El caldo picante era increíblemente sabroso y auténtico...",
      "ej., Tenían una variedad enorme de mariscos y carnes frescas...",
      "ej., La carne de res wagyu ilimitada valió totalmente la pena...",
      "ej., El servicio fue rápido, constantemente limpiaban los platos y rellenaban la sopa...",
      "ej., Me encantó la barra de salsas, muchas opciones para elegir...",
      "ej., Los ingredientes eran muy frescos, especialmente la pasta de camarón...",
      "ej., El caldo de tomate era rico y perfecto para tomar...",
      "ej., No te pierdas el helado gratis de postre...",
      "ej., Gran ambiente para una cena en grupo grande con amigos...",
    ],
    generatingTitle: "Creando tu reseña...",
    generatingSub: "Personalizando según tus comentarios",
    errorTitle: "Ups, algo salió mal.",
    errorSub: "Hubo un problema al generar tu reseña. Esto podría ser un error temporal de la red. Por favor, pide ayuda a nuestro personal si esto persiste.",
    tryAgain: "Intentar de nuevo",
    skipBtn: "Omitir y escribir reseña manualmente",
    resultTitle: "Tu Reseña",
    copyBtn: "Copiar al portapapeles",
    copiedBtn: "¡Copiado!",
    refreshes: "Intentos",
    limitReached: "Límite alcanzado",
    regenerate: "¿No es exactamente lo que buscas? Regenerar",
    postBtn: "Publicar en Google Maps",
    modalTitle: "¡Reseña copiada!",
    modalSubGoogle: "Estamos abriendo Google Maps por ti. Simplemente pega tu reseña en la caja de comentarios.",
    modalSubYelp: "Estamos abriendo Yelp por ti. Simplemente pega tu reseña en la caja de comentarios.",
    // TEAM_010: Update instruction to guide users to the "Text" tab to bypass native photo/video picker
    modalSubXiaohongshu: "Estamos abriendo Xiaohongshu. Para publicar texto, selecciona la pestaña 'Texto' (文字) en la parte inferior y pega tu reseña.",
    modalSubInstagram: "Estamos abriendo Instagram por ti. Simplemente pega tu reseña en una nueva publicación o historia.",
    modalGoGoogle: "Ir a Google Maps",
    modalGoYelp: "Ir a Yelp",
    modalGoXiaohongshu: "Ir a Xiaohongshu",
    modalGoInstagram: "Ir a Instagram",
    shareBtn: "Compartir Reseña"
  }
};
