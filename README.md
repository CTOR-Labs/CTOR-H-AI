
This **H‑AI (Human–Artificial Intelligence)** branch contains the development of multiple versions of the game **CTOR**  
https://ctorgame.com/

All implementations follow the official rules described here:  
https://github.com/CTOR-Labs/CTOR-H-AI/blob/main/mvp/CTOR-Rules.md

We maintain several prototypes of the **“Player vs AI Bot”** version of CTOR, created on different platforms and with different architectural approaches.

You can contribute to the project by helping us:  
— improve the UI  
— enhance the AI bot algorithms  
— propose architectural or gameplay improvements  
— test and evaluate the prototypes  

We apologize that the working process described below is written in Russian.  
All developers on our team understand Russian, even though we currently live in Spain, Canada, and the United States.

# 📌 Общее описание

Репозиторий содержит **три независимые линии разработки CTOR‑H‑AI**.

**Цель первого этапа:** определить удобный сервис для отработки прототипа интерфейса (цвет, анимация, кнопки управления игрой).  
**Цель второго этапа:** определить платформу, подходящую для создания более коммерческой версии, где можно менять ИИ‑бота и выпускать рабочий прототип для тестирования.

Ниже перечислены **три рабочих прототипа**, размещённые в этом репозитории.

---

# 🟦 Claude  
**Деплой:** Netlify  
**Формат:** один HTML‑файл (~1423 строки)

Первая версия CTOR, созданная в среде Claude.  
Подходит для анализа, сравнения и исторического контекста.

---

# 🟧 Lovable  
**Деплой:** только через платформу Lovable  
**Формат:** модульная структура React/Vite  
**Особенность:** другие способы деплоя не работают

UI‑ориентированный прототип.  
Используется для проверки интерфейсных решений, анимаций, визуальных элементов.  
Логические компоненты переносимы, UI‑слой — нет.

---

# 🟩 Replit  
**Деплой:** внутри Replit  
**Формат:** лёгкая JS/HTML версия  
**Ограничение:** бесплатный режим работает 14 дней, далее требуется платный тариф  
**Структура:** модульная

Подходит для быстрых прототипов, хакатонов и демонстраций.

---
# 🌐 Прототипы, которые существуют, но **не размещены в репозитории**

Эти версии доступны в сети, но не включены в текущий репозиторий.

### **VO / Vercel**  
**Название:** CTOR — Toroidal Capture Strategy Game  
**Публичный деплой:**  
https://a-ivs-h-vercel-j2ggfop68-bva5-7066s-projects.vercel.app/

### **Antigravity / Google**  
**Название:** CTOR — Premium Logic Game  
**Публичный деплой:**  
https://stunning-dodol-992107.netlify.app/

### **Comet / Perplexity**  
Локальная версия, хранится на ПК.  
Может быть предоставлена по запросу.

---

# 🗺️ Roadmap (апрель 2026)

### Доработка версии **Lovable** до уровня MVP, достаточного для тестирования:
- UI‑дизайн режима «Игрок — ИИ» (коммерческая версия или версия для LinkedIn)  
- Полный эвристический алгоритм  
- Создание учебной версии игры с объяснением правил  

### Проверка возможностей версии **Claude**:
- возможность вносить сторонние решения по дизайну  
- возможность интеграции алгоритма ИИ‑бота  
- потенциальный перенос элементов из версии Lovable  

---

# 📝 Общие замечания

- Репозиторий намеренно разделён на **три независимые архитектуры**.  
- Это позволяет параллельно развивать долгосрочные системы и быстрые прототипы.  
- MVP‑ветки должны оставаться лёгкими и автономными.  
- Ветка **Lovable** — UI‑экспериментальная, не предназначена для продакшена.  

