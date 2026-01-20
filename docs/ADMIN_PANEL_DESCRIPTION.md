# Admin Panel — Functional Description (AS-IS)

## 1. Overview

Admin Panel предназначена для управления контентом сайта, мультиязычными сущностями, интеграцией с сервисом генерации контента, обработкой входящих событий и системными настройками.

Основные функции:
- Управление статьями и категориями
- Интеграция с AI Content Generator через webhooks
- Просмотр логов событий и ошибок
- Обработка заявок с форм сайта
- Настройка email-уведомлений
- Управление юридическими документами по языкам

---

## 2. Navigation Structure

Левое меню:
- Articles
- Categories
- Content Generation
- Event Log
- Form Submissions
- Settings
- Legal Docs
- Logout

---

## 3. Articles

### Purpose
Управление мультиязычными статьями и импорт статей из AI генератора.

### Sections

#### 3.1 Import Payload
Используется для ручного импорта JSON payload, полученного от сервиса генерации контента.

**Fields:**
- Textarea: JSON payload (success response)

**Actions:**
- Import article

**Notes:**
- Payload должен соответствовать ожидаемой схеме
- Ошибки валидации логируются в Event Log

#### 3.2 Recent Articles

**Table capabilities:**
- Multiple selection via checkboxes
- Select all
- Bulk delete

**Actions:**
- New article
- Delete selected

**Expected columns (implicit):**
- ID
- Title
- Language
- Status
- Created at

---

## 4. Categories

### Purpose
Управление мультиязычными категориями контента.

### Structure

#### 4.1 Category List
- Список существующих категорий
- Кнопка New category

#### 4.2 Create / Edit Category

**Fields:**
- Slug (unique)
- Multilingual blocks:
  - Language (EN, ES, DE, etc.)
  - Name
  - Description (optional)

**Behavior:**
- Одна категория содержит несколько языковых версий
- Редактирование происходит в правой панели

---

## 5. Content Generation

### Purpose
Мониторинг интеграции с сервисом генерации контента.

### Sections

#### 5.1 Webhook URLs

**Fields (read-only):**
- Success Webhook URL
- Error Webhook URL

**Actions:**
- Copy URL

#### 5.2 Recent Events

**Table columns:**
- Time
- Type  
  (content_generation_success, content_generation_error)
- Result  
  (test_request, invalid_payload, validation_error)
- Entry
- Action: View

**Purpose:**
- Быстрая диагностика статуса интеграции

---

## 6. Event Log

### Purpose
Расширенный журнал обработки webhook payload’ов.

### Table

**Columns:**
- Time
- Type
- Result
- Entry
- Action: View

**Notes:**
- Используется для отладки и аудита
- Содержит более длинную историю событий

---

## 7. Form Submissions

### Purpose
Отслеживание заявок, отправленных через формы сайта.

### Table

**Columns:**
- Submitted (date/time)
- Name
- Email
- Status

**Notes:**
- Используется для обработки входящих обращений
- Дополнительные действия могут быть расширены в будущем

---

## 8. Settings

### Purpose
Настройка email-уведомлений системы.

### Sections

#### 8.1 SMTP Configuration

**Fields:**
- Recipient email
- SMTP host
- SMTP port
- SMTP username
- SMTP password
- Use TLS (checkbox)

#### 8.2 Email Template

**Fields:**
- Email template (text)

**Actions:**
- Save settings
- Send test email

---

## 9. Legal Docs

### Purpose
Управление юридическими документами сайта по языкам.

### Fields

- Document type  
  (Privacy Policy, Terms, etc.)
- Language
- Content (textarea)

### Metadata
- Last updated timestamp

### Actions
- Save document

---

## 10. System Characteristics

- Сквозная мультиязычность
- Payload-driven архитектура
- Интеграция через webhooks
- Админка совмещает CRUD и diagnostic функции
- Ориентация на AI-first content pipeline

---

_End of document_
