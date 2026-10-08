// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
//
// Console copy in English and Russian - the single source of every display string. Language-invariant tokens
// (the wordmark, role abbreviations, numbers, hosts, e-mail) live in the components.
import type { ConsoleRole, PushDeliveryKind, PushDeliveryOutcome, SipAccountKind } from '@/api/types';

export type Lang = 'en' | 'ru';

export interface PageCopy {
  /** Browser tab and page heading. */
  title: string;
  /** Orange one-liner above the heading - what the page is for. */
  kicker: string;
}

export interface Copy {
  /** Suffix of every browser tab title. */
  consoleName: string;
  /** Under the wordmark in the header. */
  byline: string;
  nav: {
    dashboard: string;
    sipAccounts: string;
    consoleUsers: string;
    audit: string;
    integration: string;
    about: string;
    menu: string;
  };
  pages: {
    login: PageCopy;
    dashboard: PageCopy;
    sipAccounts: PageCopy;
    consoleUsers: PageCopy;
    audit: PageCopy;
    integration: PageCopy;
    about: PageCopy;
    notFound: PageCopy;
  };
  header: {
    logOut: string;
    language: string;
    lightScheme: string;
    darkScheme: string;
  };
  footer: {
    /** Before the website link: "© 2026" + 84softworks.com. */
    copyright: string;
    server: string;
    console: string;
  };
  common: {
    cancel: string;
    create: string;
    save: string;
    done: string;
    copy: string;
    copied: string;
    copyValue: (label: string) => string;
    block: string;
    unblock: string;
    delete: string;
    newPassword: string;
    replacePassword: string;
    typePasswordByHand: string;
    password: string;
    actionsFor: (name: string) => string;
    none: string;
  };
  roles: {
    titles: Record<ConsoleRole, string>;
    legend: string;
    makeRole: (title: string) => string;
  };
  login: {
    login: string;
    password: string;
    submit: string;
  };
  dashboard: {
    counters: {
      numbers: string;
      onlineNow: string;
      panels: string;
      appClients: string;
      blocked: string;
    };
    server: string;
    serverUnreachable: string;
    serverName: string;
    serverVersion: string;
    serverLicense: string;
    consoleVersion: string;
  };
  sipAccounts: {
    kinds: Record<SipAccountKind, string>;
    newNumber: string;
    filterAll: string;
    filterPanels: string;
    filterClients: string;
    searchPlaceholder: string;
    columns: {
      number: string;
      name: string;
      externalId: string;
      kind: string;
      status: string;
      device: string;
    };
    status: { online: string; offline: string; blocked: string };
    noNumbersYet: string;
    nothingMatches: string;
    neverRegistered: string;
    seen: string;
    actions: { editDetails: string };
    issuedCreated: string;
    issuedPasswordReplaced: string;
    blockTitle: (number: string) => string;
    blockBody: string;
    deleteTitle: (number: string) => string;
    deleteBody: string;
    credentials: { number: string; domain: string; password: string };
    create: {
      title: string;
      name: string;
      nameHint: string;
      externalId: string;
      externalIdHint: Record<SipAccountKind, string>;
      typeNumberByHand: string;
      number: string;
      numberHint: string;
      generatedNumberHint: Record<SipAccountKind, string>;
      passwordHint: string;
      generatedPasswordHint: string;
    };
    edit: {
      title: (number: string) => string;
      nameHint: string;
      externalIdChangeNote: string;
    };
    rotate: {
      title: (number: string) => string;
      body: string;
    };
  };
  consoleUsers: {
    newUser: string;
    columns: {
      login: string;
      role: string;
      status: string;
      created: string;
      passwordChanged: string;
    };
    you: string;
    status: { active: string; blocked: string };
    environmentManaged: string;
    issuedCreated: string;
    issuedPasswordReplaced: string;
    credentials: { login: string; password: string };
    create: {
      title: string;
      login: string;
      loginHint: string;
      role: string;
      passwordHint: string;
      generatedPasswordHint: string;
    };
    reset: {
      title: (login: string) => string;
      body: (login: string) => string;
      passwordHint: string;
    };
  };
  audit: {
    columns: { time: string; who: string; action: string; details: string };
    nothingYet: string;
    actions: Record<string, string>;
  };
  integration: {
    tokens: {
      title: string;
      lede: string;
      newToken: string;
      columns: { name: string; prefix: string; created: string; lastUsed: string; status: string };
      status: { active: string; revoked: string };
      neverUsed: string;
      revoke: string;
      revokeTitle: (name: string) => string;
      revokeBody: string;
      issuedTitle: string;
      issuedWarning: string;
      valueLabel: string;
      nothingYet: string;
      create: { title: string; name: string; nameHint: string };
    };
    endpoints: {
      title: string;
      lede: string;
      apiBaseUrl: string;
      apiBaseUrlUnknown: string;
      sipDomain: string;
      kinds: string;
      items: { ensure: string; read: string; rotate: string; disable: string; registration: string };
      example: string;
      openApi: string;
    };
    push: {
      title: string;
      lede: string;
      enabled: string;
      url: string;
      urlHint: string;
      headerName: string;
      headerValue: string;
      headerValueHint: string;
      headerValueSet: (hint: string | null) => string;
      headerValueNotSet: string;
      replaceValue: string;
      clearValue: string;
      connectTimeout: string;
      readTimeout: string;
      savedBy: (login: string, when: string) => string;
      readOnlyNote: string;
      contractTitle: string;
      contractNote: string;
      test: string;
      testModal: {
        title: string;
        body: string;
        caller: string;
        callee: string;
        send: string;
        noUrl: string;
        result: string;
        status: string;
        duration: (ms: number) => string;
        response: string;
        error: string;
        sentBody: string;
      };
    };
    deliveries: {
      title: string;
      lede: string;
      refresh: string;
      columns: { time: string; kind: string; from: string; to: string; outcome: string; status: string; duration: string; details: string };
      kinds: Record<PushDeliveryKind, string>;
      outcomes: Record<PushDeliveryOutcome, string>;
      nothingYet: string;
    };
  };
  credentialsModal: {
    generatedPasswordWarning: string;
  };
  notFound: {
    body: string;
    back: string;
  };
  about: {
    intro: string;
    versions: string;
    console: string;
    server: string;
    serverUnknown: string;
    legal: string;
    product: string;
    productValue: string;
    licensor: string;
    /** Rendered as "<authorName> (<handle>) · 84softworks". */
    authorName: string;
    website: string;
    source: string;
    contact: string;
    license: string;
    licenseValue: string;
    licenseTerms: string;
    thirdParty: string;
    copyright: string;
  };
  api: {
    unknownError: string;
    unreachable: string;
    requestFailed: (status: string) => string;
    emptyResponse: string;
  };
}

const en: Copy = {
  consoleName: 'ThunderVox Console',
  byline: 'by 84softworks',
  nav: {
    dashboard: 'Dashboard',
    sipAccounts: 'SIP numbers',
    consoleUsers: 'Console users',
    audit: 'Audit',
    integration: 'Integration',
    about: 'About',
    menu: 'Menu',
  },
  pages: {
    login: { title: 'Log in', kicker: 'Operator console' },
    dashboard: { title: 'Dashboard', kicker: 'Numbers and server at a glance' },
    sipAccounts: { title: 'SIP numbers', kicker: 'Intercom panels and subscribers' },
    consoleUsers: { title: 'Console users', kicker: 'Who may log in here' },
    audit: { title: 'Audit', kicker: 'Who changed what, newest first' },
    integration: { title: 'Integration', kicker: 'The seam with the operator backend' },
    about: { title: 'ThunderVox Console', kicker: 'About and legal' },
    notFound: { title: 'Page not found', kicker: 'Nothing at this address' },
  },
  header: {
    logOut: 'Log out',
    language: 'Language',
    lightScheme: 'Switch to the light theme',
    darkScheme: 'Switch to the dark theme',
  },
  footer: {
    copyright: '© 2026',
    server: 'Server',
    console: 'Console',
  },
  common: {
    cancel: 'Cancel',
    create: 'Create',
    save: 'Save',
    done: 'Done',
    copy: 'Copy',
    copied: 'Copied',
    copyValue: (label) => `Copy ${label}`,
    block: 'Block',
    unblock: 'Unblock',
    delete: 'Delete',
    newPassword: 'New password',
    replacePassword: 'Replace password',
    typePasswordByHand: 'Type the password by hand',
    password: 'Password',
    actionsFor: (name) => `Actions for ${name}`,
    none: '–',
  },
  roles: {
    titles: {
      READER: 'Reader',
      ADMINISTRATOR: 'Administrator',
      SUPER_ADMINISTRATOR: 'Super administrator',
    },
    legend: 'Roles',
    makeRole: (title) => `Make ${title.toLowerCase()}`,
  },
  login: {
    login: 'Login',
    password: 'Password',
    submit: 'Log in',
  },
  dashboard: {
    counters: {
      numbers: 'numbers',
      onlineNow: 'online now',
      panels: 'panels',
      appClients: 'subscribers',
      blocked: 'blocked',
    },
    server: 'Server',
    serverUnreachable: 'Server not reachable',
    serverName: 'Name',
    serverVersion: 'Version',
    serverLicense: 'License',
    consoleVersion: 'Console',
  },
  sipAccounts: {
    kinds: { PANEL: 'Panel', CLIENT: 'Subscriber' },
    newNumber: 'New number',
    filterAll: 'All',
    filterPanels: 'Panels',
    filterClients: 'Subscribers',
    searchPlaceholder: 'Number, name or external id',
    columns: {
      number: 'Number',
      name: 'Name',
      externalId: 'External id',
      kind: 'Kind',
      status: 'Status',
      device: 'Device',
    },
    status: { online: 'Online', offline: 'Offline', blocked: 'Blocked' },
    noNumbersYet: 'No numbers yet.',
    nothingMatches: 'Nothing matches the filter.',
    neverRegistered: 'never registered',
    seen: 'seen',
    actions: { editDetails: 'Edit name and external id' },
    issuedCreated: 'Number created',
    issuedPasswordReplaced: 'Password replaced',
    blockTitle: (number) => `Block ${number}`,
    blockBody:
      'The number stops authenticating at once: new registrations and calls from it are refused. Its current registration lasts until it expires, so it can still be called for a few minutes. Unblocking restores it with the same password.',
    deleteTitle: (number) => `Delete ${number}`,
    deleteBody:
      'The number and its password are removed for good. A generated number is never handed out again; to take a device out of service for a while, block it instead.',
    credentials: {
      number: 'Number (username and authentication username)',
      domain: 'SIP domain (also the realm / outbound proxy)',
      password: 'Password',
    },
    create: {
      title: 'New SIP number',
      name: 'Name',
      nameHint: 'Any text, Russian or Latin - shown in the console and later as the caller name. A label, not a key.',
      externalId: 'External id',
      externalIdHint: {
        PANEL:
          "Device id in the operator backend - for Modus the panel's ip:port, which selects the video shown when it calls. Optional for a test number.",
        CLIENT:
          'Subscriber account in the operator backend - whom to wake with a push when this number is called. Optional for a test number.',
      },
      typeNumberByHand: 'Type the number by hand',
      number: 'Number',
      numberHint: 'Digits only, 2 to 16',
      generatedNumberHint: {
        PANEL: 'The server picks the next free panel number (2xxxxxxx).',
        CLIENT: 'The server picks the next free subscriber number (1xxxxxxx).',
      },
      passwordHint: '8 to 64 characters: latin letters, digits and symbols, no spaces',
      generatedPasswordHint: 'The server generates a 16-character password and shows it once.',
    },
    edit: {
      title: (number) => `Edit ${number}`,
      nameHint: 'A label for the console and pushes, not a key',
      externalIdChangeNote: 'Changing it re-keys the number for the operator backend.',
    },
    rotate: {
      title: (number) => `New password for ${number}`,
      body: "The old password stops working at the device's next registration. Until it gets the new password, the device cannot register or call.",
    },
  },
  consoleUsers: {
    newUser: 'New user',
    columns: {
      login: 'Login',
      role: 'Role',
      status: 'Status',
      created: 'Created',
      passwordChanged: 'Password changed',
    },
    you: '(you)',
    status: { active: 'Active', blocked: 'Blocked' },
    environmentManaged: 'Defined by the server environment (TVX_SUPERADMIN_*)',
    issuedCreated: 'User created',
    issuedPasswordReplaced: 'Password replaced',
    credentials: { login: 'Login', password: 'Password' },
    create: {
      title: 'New console user',
      login: 'Login',
      loginHint: "3 to 64 characters: latin letters, digits, '.', '_' or '-'",
      role: 'Role',
      passwordHint: 'At least 10 characters',
      generatedPasswordHint: 'The server generates a password and shows it once - hand it over to the user.',
    },
    reset: {
      title: (login) => `New password for ${login}`,
      body: (login) => `${login} is logged out everywhere and logs in again with the new password.`,
      passwordHint: 'At least 10 characters',
    },
  },
  audit: {
    columns: { time: 'Time', who: 'Who', action: 'Action', details: 'Details' },
    nothingYet: 'Nothing has happened yet.',
    actions: {
      SIP_ACCOUNT_CREATED: 'Number created',
      SIP_ACCOUNT_RENAMED: 'Number renamed',
      SIP_ACCOUNT_PASSWORD_ROTATED: 'Number password replaced',
      SIP_ACCOUNT_BLOCKED: 'Number blocked',
      SIP_ACCOUNT_UNBLOCKED: 'Number unblocked',
      SIP_ACCOUNT_DELETED: 'Number deleted',
      CONSOLE_USER_CREATED: 'User created',
      CONSOLE_USER_UPDATED: 'User changed',
      CONSOLE_USER_PASSWORD_RESET: 'User password replaced',
      SUPER_ADMINISTRATOR_SYNCED: 'Super administrator synced from the environment',
      SERVICE_TOKEN_CREATED: 'Service token issued',
      SERVICE_TOKEN_REVOKED: 'Service token revoked',
      PUSH_SETTINGS_UPDATED: 'Wake push settings changed',
      PUSH_TEST_SENT: 'Test push sent',
    },
  },
  integration: {
    tokens: {
      title: 'API access',
      lede: 'Named tokens of the service API. A token opens everything the operator backend may do; every change made with it is signed by the token name in the audit trail.',
      newToken: 'New token',
      columns: { name: 'Name', prefix: 'Prefix', created: 'Created', lastUsed: 'Last used', status: 'Status' },
      status: { active: 'Active', revoked: 'Revoked' },
      neverUsed: 'never',
      revoke: 'Revoke',
      revokeTitle: (name) => `Revoke the token "${name}"?`,
      revokeBody: 'The operator backend stops working with this token at once. Issue a new one and put it into the integration before revoking the old one.',
      issuedTitle: 'Token issued',
      issuedWarning: 'Copy the token now: only its hash is stored and it will not be shown again.',
      valueLabel: 'Token',
      nothingYet: 'No tokens yet: the service API refuses every call until one is issued.',
      create: {
        title: 'New token',
        name: 'Name',
        nameHint: 'Who uses it (the operator backend, an integrator); the audit trail shows it as token:<name>',
      },
    },
    endpoints: {
      title: 'Endpoints',
      lede: 'Ready-made calls of the service API, with the X-SERVICE-TOKEN header carrying a token from above. The same id always gets the same number.',
      apiBaseUrl: 'API base URL',
      apiBaseUrlUnknown: 'not set in the deployment (TVX_PUBLIC_API_URL) - the paths below are relative',
      sipDomain: 'SIP domain (realm)',
      kinds:
        'kind is PANEL for an intercom panel (external_id = its device id in the operator backend, for Modus the host:port of controls/devices) or CLIENT for an app subscriber (external_id = the subscriber account).',
      items: {
        ensure: 'Create or get the number of an endpoint (upsert): the password is in the response on creation only',
        read: 'The number as it is - never a password',
        rotate: 'Issue a new password (in the response)',
        disable: 'Out of service: blocked, kept for the id; the next PUT brings it back',
        registration: 'Whether the endpoint is registered right now',
      },
      example: 'Example',
      openApi: 'OpenAPI document and Swagger UI',
    },
    push: {
      title: 'Wake push',
      lede: 'When a panel calls a subscriber whose phone is asleep, the core parks the call and this server posts a wake request to the operator backend. The backend pushes the phone, the phone registers, the call goes through.',
      enabled: 'Send wake pushes',
      url: 'URL',
      urlHint: 'POST endpoint of the operator backend that turns the request into a push',
      headerName: 'Auth header',
      headerValue: 'Auth header value',
      headerValueHint: 'Stored and never shown again. Leave empty to keep the current value.',
      headerValueSet: (hint) => (hint ? `set, ends with …${hint}` : 'set'),
      headerValueNotSet: 'not set',
      replaceValue: 'Replace the value',
      clearValue: 'Clear the value',
      connectTimeout: 'Connect timeout, ms',
      readTimeout: 'Read timeout, ms',
      savedBy: (login, when) => `Saved by ${login}, ${when}`,
      readOnlyNote: 'Only the super administrator changes these settings.',
      contractTitle: 'Request body (contract v2)',
      contractNote:
        'call_id is a UUID made per call (the operator keys its call history by it); sip_call_id is the SIP Call-ID for the core log; caller_id and callee_id are the external ids of the two numbers - null when a number has none. The three v1 names (call_id, caller_id, callee_id) are kept.',
      test: 'Test push',
      testModal: {
        title: 'Test push',
        body: 'The same request a live call would send, to the URL above, right now. The result is recorded as TEST in the delivery log.',
        caller: 'Calling panel',
        callee: 'Called subscriber',
        send: 'Send',
        noUrl: 'Set the URL and save the settings first.',
        result: 'Result',
        status: 'HTTP status',
        duration: (ms) => `${ms} ms`,
        response: 'Response',
        error: 'Error',
        sentBody: 'Sent body',
      },
    },
    deliveries: {
      title: 'Delivery log',
      lede: 'Every wake push, live calls and tests alike; rows are kept for a week.',
      refresh: 'Refresh',
      columns: { time: 'Time', kind: 'Kind', from: 'From', to: 'To', outcome: 'Outcome', status: 'HTTP', duration: 'Time, ms', details: 'Response / error' },
      kinds: { LIVE: 'live', TEST: 'test' },
      outcomes: { DELIVERED: 'Delivered', REJECTED: 'Rejected', FAILED: 'Failed', SKIPPED: 'Skipped' },
      nothingYet: 'No pushes yet.',
    },
  },
  credentialsModal: {
    generatedPasswordWarning:
      'Copy the password now: it is not stored and will not be shown again. A lost password is replaced with a new one.',
  },
  notFound: {
    body: 'There is nothing at this address.',
    back: 'Back to the dashboard',
  },
  about: {
    intro:
      'Operator console of the ThunderVox SIP endpoint platform: SIP numbers of intercom panels and subscribers, who is registered right now, console users and the audit trail. ThunderVox is a product of 84softworks.',
    versions: 'Versions',
    console: 'Console',
    server: 'Server',
    serverUnknown: 'not reachable',
    legal: 'Legal',
    product: 'Product',
    productValue: 'ThunderVox – SIP platform for IP devices by 84softworks',
    licensor: 'Author and licensor',
    authorName: 'Andrei Baranov',
    website: 'Website',
    source: 'Source code',
    contact: 'Contact',
    license: 'License',
    licenseValue: 'Business Source License 1.1',
    licenseTerms:
      'Non-production use is free. Production use is permitted for up to three SIP endpoints in total; beyond that a commercial license from the licensor is required. Four years after publication the work becomes available under the Mozilla Public License 2.0.',
    thirdParty:
      'ThunderVox ships alongside Kamailio, rtpengine, PostgreSQL, nginx and other third-party software, each under its own license (NOTICE in the umbrella repository).',
    copyright: '© 2026 Andrei Baranov (84softworks). All rights reserved under the Business Source License 1.1.',
  },
  api: {
    unknownError: 'Unknown error',
    unreachable: 'Server is unreachable',
    requestFailed: (status) => `Request failed (${status})`,
    emptyResponse: 'Empty response',
  },
};

const ru: Copy = {
  consoleName: 'Консоль ThunderVox',
  byline: 'by 84softworks',
  nav: {
    dashboard: 'Обзор',
    sipAccounts: 'SIP-номера',
    consoleUsers: 'Пользователи',
    audit: 'Журнал',
    integration: 'Интеграция',
    about: 'О консоли',
    menu: 'Меню',
  },
  pages: {
    login: { title: 'Вход', kicker: 'Операторская консоль' },
    dashboard: { title: 'Обзор', kicker: 'Номера и сервер одним взглядом' },
    sipAccounts: { title: 'SIP-номера', kicker: 'Домофонные панели и абоненты' },
    consoleUsers: { title: 'Пользователи консоли', kicker: 'Кто может сюда войти' },
    audit: { title: 'Журнал действий', kicker: 'Кто что изменил, новые сверху' },
    integration: { title: 'Интеграция', kicker: 'Стык с бэкендом оператора' },
    about: { title: 'Консоль ThunderVox', kicker: 'О консоли и правовая информация' },
    notFound: { title: 'Страница не найдена', kicker: 'По этому адресу ничего нет' },
  },
  header: {
    logOut: 'Выйти',
    language: 'Язык',
    lightScheme: 'Светлая тема',
    darkScheme: 'Тёмная тема',
  },
  footer: {
    copyright: '© 2026',
    server: 'Сервер',
    console: 'Консоль',
  },
  common: {
    cancel: 'Отмена',
    create: 'Создать',
    save: 'Сохранить',
    done: 'Готово',
    copy: 'Копировать',
    copied: 'Скопировано',
    copyValue: (label) => `Копировать: ${label}`,
    block: 'Заблокировать',
    unblock: 'Разблокировать',
    delete: 'Удалить',
    newPassword: 'Новый пароль',
    replacePassword: 'Заменить пароль',
    typePasswordByHand: 'Ввести пароль вручную',
    password: 'Пароль',
    actionsFor: (name) => `Действия: ${name}`,
    none: '–',
  },
  roles: {
    titles: {
      READER: 'Наблюдатель',
      ADMINISTRATOR: 'Администратор',
      SUPER_ADMINISTRATOR: 'Суперадминистратор',
    },
    legend: 'Роли',
    makeRole: (title) => `Сделать: ${title.toLowerCase()}`,
  },
  login: {
    login: 'Логин',
    password: 'Пароль',
    submit: 'Войти',
  },
  dashboard: {
    counters: {
      numbers: 'номеров',
      onlineNow: 'онлайн сейчас',
      panels: 'панелей',
      appClients: 'абонентов',
      blocked: 'заблокировано',
    },
    server: 'Сервер',
    serverUnreachable: 'Сервер недоступен',
    serverName: 'Имя',
    serverVersion: 'Версия',
    serverLicense: 'Лицензия',
    consoleVersion: 'Консоль',
  },
  sipAccounts: {
    kinds: { PANEL: 'Панель', CLIENT: 'Абонент' },
    newNumber: 'Новый номер',
    filterAll: 'Все',
    filterPanels: 'Панели',
    filterClients: 'Абоненты',
    searchPlaceholder: 'Номер, имя или внешний id',
    columns: {
      number: 'Номер',
      name: 'Имя',
      externalId: 'Внешний id',
      kind: 'Тип',
      status: 'Статус',
      device: 'Устройство',
    },
    status: { online: 'Онлайн', offline: 'Офлайн', blocked: 'Заблокирован' },
    noNumbersYet: 'Номеров пока нет.',
    nothingMatches: 'Под фильтр ничего не подходит.',
    neverRegistered: 'ни разу не регистрировался',
    seen: 'был',
    actions: { editDetails: 'Изменить имя и внешний id' },
    issuedCreated: 'Номер создан',
    issuedPasswordReplaced: 'Пароль заменён',
    blockTitle: (number) => `Заблокировать ${number}`,
    blockBody:
      'Номер сразу перестаёт проходить авторизацию: новые регистрации и звонки с него отклоняются. Текущая регистрация живёт до истечения срока, поэтому несколько минут на номер ещё можно позвонить. Разблокировка возвращает его с тем же паролем.',
    deleteTitle: (number) => `Удалить ${number}`,
    deleteBody:
      'Номер и его пароль удаляются безвозвратно. Сгенерированный номер больше никому не выдаётся; чтобы временно вывести устройство из работы, заблокируйте номер.',
    credentials: {
      number: 'Номер (username и authentication username)',
      domain: 'SIP-домен (он же realm / outbound proxy)',
      password: 'Пароль',
    },
    create: {
      title: 'Новый SIP-номер',
      name: 'Имя',
      nameHint: 'Любой текст, русский или латиница – виден в консоли и позже как имя звонящего. Подпись, не ключ.',
      externalId: 'Внешний id',
      externalIdHint: {
        PANEL:
          'Id устройства в бэкенде оператора – для Модуса ip:port панели, по нему выбирается видео при звонке. Для тестового номера не обязателен.',
        CLIENT:
          'Лицевой счёт абонента в бэкенде оператора – кого будить пушом при звонке на этот номер. Для тестового номера не обязателен.',
      },
      typeNumberByHand: 'Ввести номер вручную',
      number: 'Номер',
      numberHint: 'Только цифры, от 2 до 16',
      generatedNumberHint: {
        PANEL: 'Сервер выдаст следующий свободный номер панели (2xxxxxxx).',
        CLIENT: 'Сервер выдаст следующий свободный номер абонента (1xxxxxxx).',
      },
      passwordHint: 'От 8 до 64 символов: латиница, цифры и знаки, без пробелов',
      generatedPasswordHint: 'Сервер сгенерирует пароль из 16 символов и покажет его один раз.',
    },
    edit: {
      title: (number) => `Изменить ${number}`,
      nameHint: 'Подпись для консоли и пушей, не ключ',
      externalIdChangeNote: 'Смена id перепривязывает номер в бэкенде оператора.',
    },
    rotate: {
      title: (number) => `Новый пароль для ${number}`,
      body: 'Старый пароль перестаёт работать при следующей регистрации устройства. Пока устройство не получит новый пароль, оно не сможет регистрироваться и звонить.',
    },
  },
  consoleUsers: {
    newUser: 'Новый пользователь',
    columns: {
      login: 'Логин',
      role: 'Роль',
      status: 'Статус',
      created: 'Создан',
      passwordChanged: 'Пароль изменён',
    },
    you: '(вы)',
    status: { active: 'Активен', blocked: 'Заблокирован' },
    environmentManaged: 'Задан окружением сервера (TVX_SUPERADMIN_*)',
    issuedCreated: 'Пользователь создан',
    issuedPasswordReplaced: 'Пароль заменён',
    credentials: { login: 'Логин', password: 'Пароль' },
    create: {
      title: 'Новый пользователь консоли',
      login: 'Логин',
      loginHint: "От 3 до 64 символов: латиница, цифры, '.', '_' или '-'",
      role: 'Роль',
      passwordHint: 'Не короче 10 символов',
      generatedPasswordHint: 'Сервер сгенерирует пароль и покажет его один раз – передайте его пользователю.',
    },
    reset: {
      title: (login) => `Новый пароль для ${login}`,
      body: (login) => `${login} выходит из консоли везде и входит заново с новым паролем.`,
      passwordHint: 'Не короче 10 символов',
    },
  },
  audit: {
    columns: { time: 'Время', who: 'Кто', action: 'Действие', details: 'Подробности' },
    nothingYet: 'Пока ничего не происходило.',
    actions: {
      SIP_ACCOUNT_CREATED: 'Номер создан',
      SIP_ACCOUNT_RENAMED: 'Номер переименован',
      SIP_ACCOUNT_PASSWORD_ROTATED: 'Пароль номера заменён',
      SIP_ACCOUNT_BLOCKED: 'Номер заблокирован',
      SIP_ACCOUNT_UNBLOCKED: 'Номер разблокирован',
      SIP_ACCOUNT_DELETED: 'Номер удалён',
      CONSOLE_USER_CREATED: 'Пользователь создан',
      CONSOLE_USER_UPDATED: 'Пользователь изменён',
      CONSOLE_USER_PASSWORD_RESET: 'Пароль пользователя заменён',
      SUPER_ADMINISTRATOR_SYNCED: 'Суперадминистратор синхронизирован из окружения',
      SERVICE_TOKEN_CREATED: 'Выпущен сервисный токен',
      SERVICE_TOKEN_REVOKED: 'Отозван сервисный токен',
      PUSH_SETTINGS_UPDATED: 'Изменены настройки пуша',
      PUSH_TEST_SENT: 'Отправлен тестовый пуш',
    },
  },
  integration: {
    tokens: {
      title: 'Доступ к API',
      lede: 'Именованные токены service-API. Токен открывает всё, что может бэкенд оператора; каждое изменение, сделанное им, подписано в журнале действий именем токена.',
      newToken: 'Новый токен',
      columns: { name: 'Название', prefix: 'Префикс', created: 'Создан', lastUsed: 'Использован', status: 'Статус' },
      status: { active: 'Активен', revoked: 'Отозван' },
      neverUsed: 'ни разу',
      revoke: 'Отозвать',
      revokeTitle: (name) => `Отозвать токен «${name}»?`,
      revokeBody: 'Бэкенд оператора с этим токеном перестанет работать сразу. Сначала выпустите новый и впишите его в интеграцию, потом отзывайте старый.',
      issuedTitle: 'Токен выпущен',
      issuedWarning: 'Скопируйте токен сейчас: хранится только его хэш, второй раз он не покажется.',
      valueLabel: 'Токен',
      nothingYet: 'Токенов ещё нет: service-API отвечает отказом, пока не выпущен хотя бы один.',
      create: {
        title: 'Новый токен',
        name: 'Название',
        nameHint: 'Кто им пользуется (бэкенд оператора, интегратор); в журнале действий это token:<название>',
      },
    },
    endpoints: {
      title: 'Эндпоинты',
      lede: 'Готовые вызовы service-API; токен из блока выше идёт в заголовке X-SERVICE-TOKEN. Один и тот же id всегда получает один и тот же номер.',
      apiBaseUrl: 'Базовый URL API',
      apiBaseUrlUnknown: 'не задан в деплое (TVX_PUBLIC_API_URL) – пути ниже относительные',
      sipDomain: 'SIP-домен (realm)',
      kinds:
        'kind – PANEL для домофонной панели (external_id = её id в бэкенде оператора, для Модуса host:port из controls/devices) или CLIENT для абонента приложения (external_id = лицевой счёт).',
      items: {
        ensure: 'Создать или получить номер абонента (upsert): пароль в ответе только при создании',
        read: 'Номер как есть – пароля не бывает',
        rotate: 'Выдать новый пароль (в ответе)',
        disable: 'Снять с обслуживания: блок, номер остаётся за id; следующий PUT вернёт его',
        registration: 'Зарегистрирован ли абонент прямо сейчас',
      },
      example: 'Пример',
      openApi: 'Документ OpenAPI и Swagger UI',
    },
    push: {
      title: 'Пробуждающий пуш',
      lede: 'Когда панель звонит абоненту, чей телефон спит, ядро паркует звонок, а этот сервер шлёт бэкенду оператора запрос на пробуждение. Бэкенд будит телефон пушем, телефон регистрируется, звонок доходит.',
      enabled: 'Слать пробуждающие пуши',
      url: 'URL',
      urlHint: 'POST-метод бэкенда оператора, который превращает запрос в пуш',
      headerName: 'Заголовок авторизации',
      headerValue: 'Значение заголовка',
      headerValueHint: 'Хранится и больше не показывается. Пустое поле – оставить текущее значение.',
      headerValueSet: (hint) => (hint ? `задано, оканчивается на …${hint}` : 'задано'),
      headerValueNotSet: 'не задано',
      replaceValue: 'Заменить значение',
      clearValue: 'Очистить значение',
      connectTimeout: 'Таймаут соединения, мс',
      readTimeout: 'Таймаут ответа, мс',
      savedBy: (login, when) => `Сохранил ${login}, ${when}`,
      readOnlyNote: 'Эти настройки меняет только суперадминистратор.',
      contractTitle: 'Тело запроса (контракт v2)',
      contractNote:
        'call_id – UUID на каждый звонок (оператор ключует им историю звонков); sip_call_id – SIP Call-ID для лога ядра; caller_id и callee_id – внешние id обоих номеров, null, если у номера его нет. Три имени v1 (call_id, caller_id, callee_id) сохранены.',
      test: 'Тестовый пуш',
      testModal: {
        title: 'Тестовый пуш',
        body: 'Тот же запрос, что ушёл бы при живом звонке, на адрес выше, прямо сейчас. Результат попадает в журнал доставок как TEST.',
        caller: 'Звонящая панель',
        callee: 'Вызываемый абонент',
        send: 'Отправить',
        noUrl: 'Сначала задайте URL и сохраните настройки.',
        result: 'Результат',
        status: 'HTTP-статус',
        duration: (ms) => `${ms} мс`,
        response: 'Ответ',
        error: 'Ошибка',
        sentBody: 'Отправленное тело',
      },
    },
    deliveries: {
      title: 'Журнал доставок',
      lede: 'Каждый пробуждающий пуш – живые звонки и тесты; строки хранятся неделю.',
      refresh: 'Обновить',
      columns: { time: 'Время', kind: 'Вид', from: 'От', to: 'Кому', outcome: 'Итог', status: 'HTTP', duration: 'Время, мс', details: 'Ответ / ошибка' },
      kinds: { LIVE: 'звонок', TEST: 'тест' },
      outcomes: { DELIVERED: 'Доставлен', REJECTED: 'Отклонён', FAILED: 'Не доставлен', SKIPPED: 'Пропущен' },
      nothingYet: 'Пушей ещё не было.',
    },
  },
  credentialsModal: {
    generatedPasswordWarning:
      'Скопируйте пароль сейчас: он не хранится и больше не будет показан. Потерянный пароль заменяется новым.',
  },
  notFound: {
    body: 'По этому адресу ничего нет.',
    back: 'Вернуться на обзор',
  },
  about: {
    intro:
      'Операторская консоль SIP-платформы ThunderVox: SIP-номера домофонных панелей и абонентов, кто зарегистрирован прямо сейчас, пользователи консоли и журнал действий. ThunderVox – продукт 84softworks.',
    versions: 'Версии',
    console: 'Консоль',
    server: 'Сервер',
    serverUnknown: 'недоступен',
    legal: 'Правовая информация',
    product: 'Продукт',
    productValue: 'ThunderVox – SIP-платформа IP-устройств от 84softworks',
    licensor: 'Автор и лицензиар',
    authorName: 'Андрей Баранов',
    website: 'Сайт',
    source: 'Исходный код',
    contact: 'Связь',
    license: 'Лицензия',
    licenseValue: 'Business Source License 1.1',
    licenseTerms:
      'Непродуктивное использование бесплатно. Продуктивное использование разрешено не более чем для трёх SIP-устройств в сумме; сверх этого нужна коммерческая лицензия от лицензиара. Через четыре года после публикации код становится доступен по Mozilla Public License 2.0.',
    thirdParty:
      'ThunderVox поставляется вместе с Kamailio, rtpengine, PostgreSQL, nginx и другим сторонним ПО, у каждого своя лицензия (NOTICE в зонтичном репозитории).',
    copyright: '© 2026 Андрей Баранов (84softworks). Все права защищены согласно Business Source License 1.1.',
  },
  api: {
    unknownError: 'Неизвестная ошибка',
    unreachable: 'Сервер недоступен',
    requestFailed: (status) => `Запрос не выполнен (${status})`,
    emptyResponse: 'Пустой ответ',
  },
};

export const dict: Record<Lang, Copy> = { en, ru };
