# Floripa Cupons

Aplicativo mobile em React Native/Expo criado para o desafio técnico de Engenheiro de Software Mobile. O projeto reproduz a tela de cupons do Floripa em Dobro e adiciona um CRUD local para criação, edição, remoção e organização de cards.

## Objetivo

O app atende aos principais pontos do desafio:

- tela de listagem de cupons inspirada no layout fornecido;
- tela de adicionar/editar cupom;
- CRUD local sem backend;
- gerenciamento global de estado com Zustand;
- persistência local com AsyncStorage;
- navegação entre lista e formulário;
- TypeScript com tipagem forte;
- testes com Jest e React Native Testing Library.

## Stack

- Expo
- React Native
- TypeScript
- Zustand
- AsyncStorage
- React Navigation
- Zod
- Jest
- React Native Testing Library

## Estrutura

```text
src
  components   Componentes reutilizáveis, como o CouponCard
  hooks        Lógica de formulário e estado local
  mocks        Dados iniciais mockados
  navigation   Configuração de rotas
  screens      Telas principais do app
  store        Store global com Zustand
  theme        Cores, espaçamentos e tipografia
  types        Tipos compartilhados
  utils        Validações e utilitários

assets
  icons        Ícones SVG usados na UI
  images       Imagens estáticas
```

## Funcionalidades

### Listagem de Cupons

A tela principal contém header, botão de login/cadastro, barra de busca, carrossel de categorias, banner e cards de cupons. O foco visual foi aproximar cores, espaçamentos, tipografia, bordas e proporções do protótipo fornecido.

Na aba `Cupons`, são exibidos apenas cards válidos, ou seja, com título preenchido. Cards incompletos salvos como rascunho ficam ocultos nessa tela.

### Gerir

A aba `Gerir` exibe todos os cards, inclusive rascunhos incompletos. Nessa visão, cada card mostra ações de editar e excluir, além de permitir reorganização por toque longo e arraste.

### Novo Card

O botão `Novo Card` no footer navega para o formulário de criação. O formulário permite configurar:

- imagem do prato;
- logomarca do restaurante;
- título;
- promoção/descrição;
- horário de abertura;
- horário de fechamento;
- selo de promoção.

### Favoritos

Na listagem principal, o ícone de coração pode ser acionado sem abrir a edição do card. Ao tocar, ele é preenchido com a cor definida para o estado favoritado.

### Validação e Rascunhos

O campo `Título` é obrigatório para que o card apareça na listagem principal. Caso o usuário tente sair com alterações não salvas, o app exibe um modal de confirmação com opções para salvar, descartar ou cancelar.

Se um card incompleto for salvo como rascunho, ele permanece disponível na aba `Gerir` para edição posterior.

## Estado Global

O projeto usa Zustand porque ele é simples, leve e direto para um CRUD local. A store centraliza:

- lista de cupons;
- adição de cupom;
- atualização;
- remoção;
- busca por id;
- reordenação.

A persistência é feita com AsyncStorage usando o middleware `persist` do Zustand.

## Tipagem

O projeto usa TypeScript com `strict: true`. Os principais contratos ficam em `src/types`, incluindo:

- `Coupon`;
- `CouponFormInput`;
- `CouponId`;
- tipos de navegação.

Também há tipagem explícita em props, store, hooks, helpers de validação e testes.

## Rich Text

O campo de promoção usa uma abordagem simples baseada em marcação:

- `**texto**` para negrito;
- `*texto*` para itálico.

Essa decisão mantém o projeto leve e compatível com Expo Go, sem adicionar dependências nativas que poderiam impactar a execução.

## Como Rodar

Instale as dependências:

```bash
npm install
```

Inicie o Expo:

```bash
npm start
```

Ou diretamente no Android:

```bash
npm run android
```

## Testes

Execute:

```bash
npm test
```

Os testes cobrem:

- store de cupons: adicionar, atualizar, remover e reordenar;
- formulário: título obrigatório e descrição opcional;
- card: toque no card e favorito sem propagação;
- listagem: rascunho sem título aparece apenas em `Gerir`.

## Typecheck

Execute:

```bash
npm run typecheck
```

## Decisões Técnicas

- Zustand foi escolhido por ser a biblioteca usada pela equipe e por se encaixar bem no escopo local do desafio.
- AsyncStorage foi usado para persistência simples, suficiente para um app sem backend.
- Zod foi usado para centralizar validações e manter consistência entre formulário e tipos.
- A funcionalidade de arrastar/reordenar foi implementada com APIs do React Native para manter compatibilidade com Expo Go.
- Os testes evitam detalhes frágeis de layout e focam em comportamento observável.

## Scripts

```bash
npm start
npm run android
npm run ios
npm run web
npm run typecheck
npm test
```
