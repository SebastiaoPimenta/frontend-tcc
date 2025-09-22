# Frontend - Sistema de Otimização de Rotas Agropecuárias

Frontend desenvolvido em Angular para o sistema de otimização de rotas de produtos agropecuários. Integra com o backend Java/Quarkus que utiliza algoritmos genéticos para otimização.

## 🚀 Características

- **Interface Intuitiva**: Fluxo de trabalho em etapas para facilitar o uso
- **Integração Google Maps**: Seleção visual de locais no mapa interativo
- **Formulários Dinâmicos**: Cadastro de produtos com validações em tempo real
- **Resultados Visuais**: Exibição clara da rota otimizada e métricas
- **Responsivo**: Interface adaptável para desktop e mobile
- **Validações**: Validação completa de dados antes da otimização

## 🏗️ Arquitetura

```
src/
├── app/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── google-maps/     # Componente do mapa interativo
│   │   ├── product-form/    # Formulário de produtos
│   │   └── route-results/   # Exibição de resultados
│   ├── models/              # Interfaces TypeScript
│   ├── services/            # Serviços HTTP e lógica de negócio
│   └── environments/        # Configurações de ambiente
```

## 📋 Pré-requisitos

- Node.js 18+ e npm
- Angular CLI 19+
- Chave da API Google Maps
- Backend da aplicação rodando

## ⚙️ Configuração

1. **Clone e instale dependências**:
```bash
cd frontend-app
npm install
```

2. **Configure a API do Google Maps**:
   - Obtenha uma chave da API no [Google Cloud Console](https://console.cloud.google.com/)
   - Ative as APIs: "Maps JavaScript API", "Geocoding API"
   - Substitua `YOUR_GOOGLE_MAPS_API_KEY_HERE` nos arquivos:
     - `src/index.html`
     - `src/environments/environment.ts`
     - `src/environments/environment.prod.ts`

3. **Configure o backend URL**:
   - Edite `src/environments/environment.ts`
   - Ajuste a URL do backend se necessário (padrão: `http://localhost:8080`)

## 🚀 Execução

### Modo Desenvolvimento
```bash
ng serve
```
Acesse: http://localhost:4200

### Modo Produção
```bash
ng build --prod
```

## 📱 Como Usar

### 1. Local de Início
- Clique em "Selecionar Local de Início"
- Clique no mapa para definir o ponto de partida
- O sistema fará geocoding reverso para obter o endereço

### 2. Pontos de Entrega
- Clique em "Adicionar Ponto de Entrega"
- Clique no mapa para cada local de entrega
- Visualize a lista de entregas cadastradas

### 3. Produtos e Configurações
- Para cada entrega, configure:
  - Informações do cliente (nome, telefone, prioridade)
  - Produtos a serem entregues
  - Tempo máximo antes do produto estragar
- Configure parâmetros do veículo:
  - Velocidade média
  - Tempo de carregamento
  - Uso do Google Maps API

### 4. Resultado
- Clique em "Otimizar Rota"
- Visualize:
  - Rota otimizada
  - Distância e tempo total
  - Ordem de entregas
  - Viabilidade da rota

## 🔧 Estrutura dos Dados

### Modelos Principais
- **Location**: Latitude, longitude, endereço, cidade, estado
- **Product**: Nome, tipo, quantidade, unidade, tempo máximo, temperatura
- **Delivery**: Local, produtos, cliente, telefone, prioridade
- **RouteOptimizationRequest**: Local inicial, entregas, configurações do veículo
- **RouteOptimizationResponse**: Rota otimizada, métricas, ordem de entregas

## 🎨 Customização

### Estilos
- CSS centralizado em `app.component.css`
- Variáveis CSS para cores e espaçamentos
- Design responsivo com CSS Grid e Flexbox

### Componentes
- Componentes modulares e reutilizáveis
- Comunicação via `@Input()` e `@Output()`
- Validações reativas com Angular Forms

## 🧪 Desenvolvimento

### Gerar novo componente
```bash
ng generate component components/nome-componente
```

### Gerar novo serviço
```bash
ng generate service services/nome-servico
```

### Gerar novo modelo
```bash
ng generate interface models/nome-modelo
```

## 🌐 Integração com Backend

O frontend consome os seguintes endpoints:

- `POST /api/route-optimization/optimize` - Otimizar rota
- `POST /api/route-optimization/check-feasibility` - Verificar viabilidade
- `GET /api/route-optimization/info` - Informações do serviço

## 📊 Funcionalidades Implementadas

✅ Seleção visual de locais no mapa
✅ Formulários dinâmicos para produtos
✅ Validações em tempo real
✅ Integração com backend via HTTP
✅ Exibição de resultados da otimização
✅ Interface responsiva
✅ Geocoding reverso
✅ Estados de carregamento e erro

## 🔄 Próximas Funcionalidades

- [ ] Salvar/carregar configurações
- [ ] Exportar resultados (PDF/Excel)
- [ ] Histórico de otimizações
- [ ] Visualização da rota no mapa
- [ ] Modo offline básico
- [ ] Temas escuro/claro

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature')
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 📞 Suporte

Para dúvidas sobre configuração ou uso, consulte a documentação do backend ou abra uma issue.

---

**Desenvolvido como parte do Trabalho de Conclusão de Curso (TCC)**
