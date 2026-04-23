# Roadmap — App de Gerenciamento de Máquinas

> App mobile local (React Native + Expo + TypeScript) para cadastro de máquinas e suas peças/requisitos de fabricação. Sem autenticação, dados persistidos 100% localmente.

---

## Stack Definida

| Camada | Lib |
|---|---|
| Framework | React Native + Expo SDK 52+ (managed workflow) |
| Linguagem | TypeScript |
| Banco de dados | `expo-sqlite` (SQLite local, baseado em arquivo) |
| Câmera / Galeria | `expo-camera` + `expo-image-picker` |
| Armazenamento de fotos | `expo-file-system` |
| Backup / Restore | `jszip` + `expo-sharing` + `expo-document-picker` |
| Navegação | React Navigation v7 (Stack + Bottom Tabs) |
| Componentes UI | React Native Paper |
| Estado global | Zustand |

---

## Setup do Projeto

### 1. Criar o projeto

```bash
npx create-expo-app@latest maquinas-app --template blank-typescript
cd maquinas-app
```

### 2. Instalar as dependências

```bash
# Navegação
npx expo install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated

# Banco de dados
npx expo install expo-sqlite

# Câmera e mídia
npx expo install expo-camera expo-image-picker expo-file-system expo-media-library

# UI
npx expo install react-native-paper react-native-vector-icons

# Estado global
npm install zustand

# Backup (Fase 3)
npm install jszip
npx expo install expo-sharing expo-document-picker
```

### 3. Rodar o projeto

```bash
npx expo start
# Escanear o QR Code com o app Expo Go no Android
```

---

## Schema do Banco de Dados (SQLite)

> A opção de armazenar peças como JSON dentro da entidade `machines` foi adotada para simplificar a implementação, dado que peças não precisam ser reutilizadas nem relacionadas a outras entidades.

### Tabela: `machines`

```sql
CREATE TABLE IF NOT EXISTS machines (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  name      TEXT    NOT NULL,
  description TEXT,
  photos    TEXT    NOT NULL DEFAULT '[]', -- JSON: string[] de caminhos no diretório do app
  parts     TEXT    NOT NULL DEFAULT '[]', -- JSON: Part[] (ver tipo abaixo)
  created_at TEXT   NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT   NOT NULL DEFAULT (datetime('now'))
);
```

> Não há tabelas separadas para fotos ou peças. Ambas são armazenadas como JSON nos campos `photos` e `parts` da máquina.

### Tipos TypeScript esperados

```typescript
// Peça individual (armazenada como JSON no campo parts)
export type Part = {
  id: string;           // UUID gerado no app (ex: crypto.randomUUID())
  name: string;
  quantity: number;     // inteiro, default 0
  weight: number;       // decimal (6,2), default 0.00
  photos: string[];     // array de caminhos de arquivo dentro do diretório do app
};

// Máquina (mapeada da tabela machines)
export type Machine = {
  id: number;
  name: string;
  description?: string;
  photos: string[];     // deserializado do JSON
  parts: Part[];        // deserializado do JSON
  createdAt: string;
  updatedAt: string;
};
```

### Inicialização do banco

```typescript
// src/database/init.ts
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('machines.db');

export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS machines (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      description TEXT,
      photos      TEXT    NOT NULL DEFAULT '[]',
      parts       TEXT    NOT NULL DEFAULT '[]',
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

export default db;
```

---

## Estrutura de Pastas Sugerida

```
maquinas-app/
├── assets/
├── src/
│   ├── components/          # Componentes reutilizáveis (MachineCard, PartCard, ImageCarousel, EmptyState...)
│   ├── database/
│   │   ├── init.ts          # Criação das tabelas
│   │   └── machines.ts      # Funções CRUD de máquinas (getAllMachines, insertMachine, etc.)
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   ├── screens/
│   │   ├── MachineListScreen.tsx
│   │   ├── MachineFormScreen.tsx
│   │   ├── MachineDetailScreen.tsx
│   │   ├── PartFormScreen.tsx
│   │   └── SettingsScreen.tsx   # Fase 3: Backup/Restore
│   ├── store/
│   │   └── useMachineStore.ts   # Zustand store
│   ├── types/
│   │   └── index.ts             # Machine, Part, etc.
│   └── utils/
│       ├── fileSystem.ts        # Helpers para salvar/deletar fotos
│       └── backup.ts            # Fase 3: lógica de zip/unzip
└── App.tsx
```

---

## Fase 1 — CRUD de Máquinas

**Objetivo:** O usuário consegue cadastrar, listar, editar e excluir máquinas com nome, descrição e múltiplas fotos.

### Banco de dados
- [x] Criar função `initDatabase()` e chamá-la no `App.tsx`
- [x] Implementar helpers CRUD em `src/database/machines.ts`:
  - `getAllMachines()` — lista todas
  - `getMachineById(id)` — busca por ID
  - `insertMachine(data)` — insere nova máquina
  - `updateMachine(id, data)` — atualiza existente
  - `deleteMachine(id)` — remove máquina e suas fotos do sistema de arquivos

### Armazenamento de fotos
- [x] Configurar `expo-file-system` para salvar fotos em `FileSystem.documentDirectory/my-machines/photos/`
- [x] Ao salvar uma foto (câmera ou galeria), copiar para a pasta permanente do app e guardar o caminho relativo no JSON
- [x] Ao deletar uma máquina, varrer o campo `photos` e excluir os arquivos correspondentes

### Câmera e Galeria
- [x] Solicitar permissões de câmera e galeria com `expo-camera` e `expo-image-picker`
- [x] Implementar componente `ImagePickerButton` que abre modal com as opções "Câmera" / "Galeria"

### Telas e Componentes
- [x] **`MachineListScreen`**
  - Listagem de máquinas em cards (`FlatList`)
  - Campo de busca por nome (filtro local, sem query no banco)
  - Empty state com ícone e texto "Nenhuma máquina cadastrada"
  - Botão FAB "+" para abrir o formulário de criação
- [x] **`MachineCard`**
  - Thumbnail da primeira foto (sem carrossel — alinhado com o protótipo)
  - Nome, descrição resumida, badge com contagem de peças
  - Acesso à tela de detalhes ao tocar no card
- [x] **`MachineFormScreen`** (criação e edição)
  - Campos: Nome (obrigatório), Descrição
  - Seção de fotos com miniaturas e botão para adicionar (câmera ou galeria)
  - Opção de remover foto individual
  - Botão "Salvar Máquina" e retorno via header
- [x] **`MachineDetailScreen`**
  - Carrossel de fotos com indicadores de página
  - Botão de edição (header) e exclusão com confirmação
  - Lista de peças existentes (read-only — CRUD de peças na Fase 2)

### Navegação
- [x] Configurar Stack Navigator: `MachineList → MachineDetail → MachineForm`

---

## Fase 2 — CRUD de Peças

**Objetivo:** Dentro de cada máquina, o usuário gerencia as peças necessárias com nome, quantidade, peso e fotos.

### Banco de dados
- [ ] Peças são armazenadas no campo `parts` (JSON) da tabela `machines` — não há tabela separada
- [x] `updateMachine(id, { parts: [...] })` já implementado e pronto para uso
- [ ] IDs de peças gerados no cliente (sem crypto.randomUUID — usar Date.now()+Math.random() conforme fileSystem.ts)

### Armazenamento de fotos de peças
- [ ] Mesma lógica da Fase 1 (pasta `photos/` dentro de `FileSystem.documentDirectory/my-machines/`)
- [ ] Ao deletar uma peça, excluir os arquivos de foto referenciados
- [x] Ao deletar uma máquina, já exclui todas as fotos de todas as peças junto

### Telas e Componentes
- [ ] **`PartListScreen`** (dentro de `MachineDetailScreen` ou tela separada)
  - Lista de peças da máquina com `FlatList`
  - Empty state: "Nenhuma peça cadastrada para esta máquina"
  - Botão FAB "+" para adicionar peça
- [ ] **`PartCard`**
  - Thumbnail da primeira foto da peça
  - Nome, Quantidade, Peso
  - Opções de editar e excluir
- [ ] **`PartFormScreen`** (criação e edição)
  - Campos: Nome (obrigatório), Quantidade (inteiro, default 0), Peso (decimal, default 0.00)
  - Seção de fotos com miniaturas e botão para adicionar (câmera ou galeria)
  - Validação básica: quantidade não negativa, peso não negativo
  - Botão "Salvar Peça" e cancelar

### Navegação
- [ ] Adicionar `PartForm` no Stack Navigator

---

## Fase 3 — Ferramenta de Backup e Restore

**Objetivo:** Permitir que o usuário faça backup de todos os dados e fotos em um `.zip`, e restaure em um novo aparelho.

> Esta fase não é necessária para o lançamento da v1, mas já está prevista na arquitetura (sem impacto estrutural nas fases anteriores).

### Backup
- [ ] Tela/seção de configurações (`SettingsScreen`) com botão "Fazer Backup"
- [ ] Fluxo ao acionar o backup:
  1. Exportar todos os registros da tabela `machines` como `backup.json`
  2. Varrer `FileSystem.documentDirectory/my-machines/` e coletar todos os arquivos do app
  3. Gerar um `.zip` com `jszip` contendo o `backup.json` + árvore de arquivos de `FileSystem.documentDirectory/my-machines/`
  4. Abrir o menu nativo de compartilhamento com `expo-sharing` (usuário escolhe: e-mail, Drive, WhatsApp, etc.)

### Restore
- [ ] Botão "Restaurar Backup" na `SettingsScreen`
- [ ] Fluxo ao acionar o restore:
  1. Abrir `expo-document-picker` para o usuário selecionar o `.zip`
  2. Descompactar com `jszip`
  3. Copiar fotos para `FileSystem.documentDirectory/my-machines/photos/`
  4. Ler o `backup.json` e reinserir todos os registros no banco SQLite
  5. Exibir confirmação de sucesso ou mensagem de erro detalhada
- [ ] Exibir aviso claro: "Esta operação irá sobrescrever todos os dados atuais do app."

> Dependências a instalar antes desta fase: `npm install jszip && npx expo install expo-sharing expo-document-picker`

---

## Observações Gerais

- **Sem autenticação:** o app abre direto na lista de máquinas.
- **Arquivos locais do app:** fotos e futuros artefatos de backup ficam em `FileSystem.documentDirectory/my-machines/`, mantendo tudo em um diretório dedicado e nunca enviando nada para a nuvem.
- **Campos de peças:** `quantity` é `integer` com default `0`; `weight` é `real` (equivalente ao DECIMAL(6,2)) com default `0.0`, ambos `NOT NULL` na tipagem TypeScript mesmo estando no JSON.
- **Backup não destrutivo:** o `.zip` é apenas gerado e compartilhado — nenhuma exclusão de dados ocorre durante o backup.