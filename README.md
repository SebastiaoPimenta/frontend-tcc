# 🚛 Sistema de Otimização de Rotas Agropecuárias

Sistema completo para otimização inteligente de rotas de entrega de produtos agropecuários, desenvolvido com Angular 19 e algoritmos genéticos.

## 📋 Descrição

Este projeto implementa uma solução completa para otimização de rotas de entrega no agronegócio, considerando fatores como:
- 📍 Pontos de partida e entrega
- 📦 Diferentes tipos de produtos (grãos, fertilizantes, sementes)
- 🌡️ Requisitos de temperatura para produtos refrigerados
- ⚡ Prioridades de entrega
- 🚚 Configurações do veículo

## 🏗️ Arquitetura

### Frontend (Angular 19)
- **Framework:** Angular 19 com standalone components
- **Maps:** Google Maps API integração
- **Formulários:** Reactive Forms com validação
- **Styling:** CSS Grid + Flexbox responsivo
- **TypeScript:** Tipagem forte com interfaces

### Backend (Documentado)
- **Algoritmo:** Genético para otimização de rotas
- **APIs:** RESTful para comunicação
- **Dados:** Suporte a múltiplos tipos de produtos

## 🚀 Funcionalidades

### ✅ Implementadas
- 🗺️ **Seleção Interativa de Locais** - Google Maps integrado
- 📝 **Formulários Dinâmicos** - Produtos e configurações
- 🎯 **Validação Completa** - Verificação de dados em tempo real
- 📊 **Visualização de Resultados** - Métricas e rota otimizada
- 🎨 **Interface Responsiva** - Design moderno e intuitivo
- 🔄 **Navegação por Etapas** - Processo guiado step-by-step

### 🔮 Planejadas
- 🔗 **Integração Backend** - Comunicação com API
- 📱 **App Mobile** - React Native/Flutter
- 📈 **Dashboard Analytics** - Métricas avançadas
- 🤖 **IA Predictiva** - Otimização baseada em histórico

## 📁 Estrutura do Projeto

```
frontend-tcc/
├── documentacao_backend.md     # 📚 Documentação do backend
├── frontend-app/               # 🎨 Aplicação Angular
│   ├── src/app/
│   │   ├── components/         # 🧩 Componentes Angular
│   │   │   ├── google-maps/    # 🗺️ Integração Google Maps
│   │   │   ├── product-form/   # 📝 Formulário de produtos
│   │   │   └── route-results/  # 📊 Resultados da otimização
│   │   ├── models/             # 📋 Interfaces TypeScript
│   │   ├── services/           # 🔧 Serviços Angular
│   │   └── environments/       # ⚙️ Configurações
│   └── INSTRUCOES_GOOGLE_MAPS.md  # 🗺️ Setup Google Maps
└── README.md                   # 📖 Este arquivo
```

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Chave API do Google Maps

### Passos

1. **Clone o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd frontend-tcc
   ```

2. **Instale as dependências:**
   ```bash
   cd frontend-app
   npm install
   ```

3. **Configure Google Maps API:**
   - Obtenha uma chave API no [Google Cloud Console](https://console.cloud.google.com/)
   - Habilite as APIs: Maps JavaScript, Geocoding, Places
   - Configure as chaves em:
     - `src/environments/environment.ts`
     - `src/index.html`

4. **Execute a aplicação:**
   ```bash
   npm start
   ```

5. **Acesse:** http://localhost:4200

## 🎯 Como Usar

### 1. **Local de Início** 🏭
- Clique em "Selecionar Local de Início"
- Clique no mapa para definir o ponto de partida

### 2. **Pontos de Entrega** 🚚
- Clique em "Adicionar Ponto de Entrega"
- Adicione quantos pontos precisar

### 3. **Produtos & Configurações** 📦
- Configure velocidade e tempo de carregamento
- Para cada entrega, adicione:
  - Nome e telefone do cliente
  - Produtos (tipo, quantidade, peso, temperatura)
  - Prioridade da entrega

### 4. **Otimização** 🚀
- Clique em "Otimizar Rota"
- Visualize os resultados com métricas detalhadas

## 🗺️ Configuração Google Maps

Consulte `frontend-app/INSTRUCOES_GOOGLE_MAPS.md` para instruções detalhadas de configuração da API do Google Maps.

## 🧪 Tecnologias

### Frontend
- **Angular 19** - Framework principal
- **TypeScript** - Linguagem de programação
- **Google Maps API** - Mapas e geocoding
- **RxJS** - Programação reativa
- **CSS Grid/Flexbox** - Layout responsivo

### Ferramentas
- **Angular CLI** - Scaffolding e build
- **npm** - Gerenciamento de pacotes
- **Git** - Controle de versão

## 📊 Status do Desenvolvimento

| Componente | Status | Funcionalidade |
|------------|--------|----------------|
| Google Maps | ✅ | Seleção de locais com marcadores |
| Product Form | ✅ | Formulário dinâmico com validação |
| Route Results | ✅ | Exibição de resultados otimizados |
| App Component | ✅ | Navegação entre etapas |
| Services | ✅ | Comunicação com backend |
| Styling | ✅ | Design responsivo e moderno |

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Contato

Projeto desenvolvido para otimização de rotas no agronegócio.

---

⭐ **Se este projeto foi útil, considere dar uma estrela!**