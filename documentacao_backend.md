# Route Optimization Service - Backend TCC

Backend desenvolvido em Quarkus + Java para otimização de rotas de entrega de produtos agropecuários utilizando algoritmos genéticos com a biblioteca Jenetics.

## 🚀 Características

- **Algoritmo Genético**: Utiliza a biblioteca Jenetics para otimização inteligente de rotas
- **Integração Google Maps**: API Matrix do Google Maps para cálculo preciso de distâncias e tempos
- **Validação de Viabilidade**: Verifica se é possível entregar produtos antes da deterioração
- **REST API**: Endpoints RESTful para integração com frontend
- **Produtos Perecíveis**: Considera tempo de deterioração dos produtos agropecuários
- **Fallback**: Cálculo de distâncias em linha reta quando Google Maps não disponível

## 🏗️ Arquitetura

```
src/
├── main/java/com/agropecuaria/route/
│   ├── algorithms/     # Algoritmos genéticos
│   ├── controllers/    # Controladores (futura expansão)
│   ├── daos/          # Data Access Objects (futura expansão)
│   ├── models/        # Modelos de dados
│   ├── rest/          # Endpoints REST
│   └── services/      # Serviços (Google Maps, etc.)
└── test/java/         # Testes unitários
```

## 📋 Pré-requisitos

- Java 17 ou superior
- Maven 3.8+
- Chave da API Google Maps (opcional, mas recomendado)

## ⚙️ Configuração

1. **Clone o repositório**:
```bash
git clone <repository-url>
cd backend-tcc
```

2. **Configure a API do Google Maps**:
   - Copie o arquivo de exemplo: `cp .env.example .env`
   - Obtenha uma chave da API no [Google Cloud Console](https://console.cloud.google.com/)
   - Ative a "Distance Matrix API"
   - Edite o arquivo `.env` e adicione sua chave:

```bash
# No arquivo .env
GOOGLE_MAPS_API_KEY=AIzaSyCf_WeR5extE-qTqdQG4c2md5XoXO68h3c
```

   **⚠️ Importante**: O arquivo `.env` está no `.gitignore` para proteger sua chave de API.

3. **Compile o projeto**:
```bash
./mvnw clean compile
```

## 🚀 Execução

### Modo Desenvolvimento
```bash
./mvnw quarkus:dev
```

### Modo Produção
```bash
./mvnw clean package
java -jar target/quarkus-app/quarkus-run.jar
```

## 📚 API Endpoints

### 1. Otimizar Rota
**POST** `/api/route-optimization/optimize`

Otimiza a rota de entrega considerando restrições de tempo dos produtos.

**Exemplo de Requisição**:
```json
{
  "startLocation": {
    "latitude": -23.5505,
    "longitude": -46.6333,
    "address": "Fazenda São João, São Paulo, SP",
    "city": "São Paulo",
    "state": "SP"
  },
  "deliveries": [
    {
      "location": {
        "latitude": -22.9068,
        "longitude": -43.1729,
        "address": "Rua das Flores, 123, Rio de Janeiro, RJ",
        "city": "Rio de Janeiro",
        "state": "RJ"
      },
      "products": [
        {
          "name": "Leite Fresco",
          "type": "Lácteo",
          "quantity": 100.0,
          "unit": "litros",
          "maxDeliveryTimeMinutes": 240,
          "description": "Leite fresco de vaca",
          "temperature": "refrigerado"
        }
      ],
      "customerName": "Padaria Central",
      "customerPhone": "(21) 99999-9999",
      "priority": 1
    },
    {
      "location": {
        "latitude": -15.7942,
        "longitude": -47.8822,
        "address": "Setor Comercial Sul, Brasília, DF",
        "city": "Brasília",
        "state": "DF"
      },
      "products": [
        {
          "name": "Queijo Minas",
          "type": "Lácteo",
          "quantity": 50.0,
          "unit": "kg",
          "maxDeliveryTimeMinutes": 360,
          "description": "Queijo minas artesanal",
          "temperature": "refrigerado"
        }
      ],
      "customerName": "Mercado do Cerrado",
      "customerPhone": "(61) 88888-8888",
      "priority": 2
    }
  ],
  "vehicleSpeedKmH": 60.0,
  "loadingTimeMinutes": 15,
  "useGoogleMaps": true
}
```

**Exemplo de Resposta**:
```json
{
  "optimizedRoute": [0, 1],
  "deliveryOrder": [
    {
      "location": { /* primeira entrega otimizada */ },
      "products": [ /* produtos */ ],
      "customerName": "Padaria Central"
    },
    {
      "location": { /* segunda entrega otimizada */ },
      "products": [ /* produtos */ ],
      "customerName": "Mercado do Cerrado"
    }
  ],
  "totalDistanceKm": 1247.5,
  "totalTimeMinutes": 187,
  "feasible": true,
  "message": "Rota otimizada com sucesso",
  "algorithmExecutionTimeMs": 1250
}
```

### 2. Verificar Viabilidade
**POST** `/api/route-optimization/check-feasibility`

Verifica se é possível realizar todas as entregas sem otimizar a rota.

### 3. Informações do Serviço
**GET** `/api/route-optimization/info`

Retorna informações sobre o serviço.

## 🧪 Testes

Execute os testes unitários:
```bash
./mvnw test
```

Execute testes de integração:
```bash
./mvnw verify
```

## 🔧 Configurações Avançadas

### Parâmetros do Algoritmo Genético

Você pode ajustar os parâmetros no `application.properties`:

```properties
route.optimization.population.size=100
route.optimization.max.generations=500
route.optimization.mutation.probability=0.15
route.optimization.crossover.probability=0.65
```

### Timeouts e Performance

```properties
quarkus.rest-client.timeout=30000
```

## 🐳 Docker

Para criar uma imagem Docker:

```bash
./mvnw clean package
docker build -f src/main/docker/Dockerfile.jvm -t route-optimization .
```

Executar container:
```bash
docker run -i --rm -p 8080:8080 -e GOOGLE_MAPS_API_KEY=sua_chave route-optimization
```

## 📊 Como Funciona o Algoritmo

1. **Preparação**: Converte localizações em matriz de distâncias/tempos
2. **Validação**: Verifica se alguma entrega é impossível (tempo direto > limite)
3. **Evolução**: Algoritmo genético otimiza a ordem das entregas
4. **Fitness**: Função considera tempo total + penalidades por violações
5. **Resultado**: Retorna rota otimizada com métricas

### Função de Fitness

A função de fitness considera:
- **Tempo total da rota**: Soma de tempos de viagem + carregamento
- **Penalidades**: Violações de limite de tempo dos produtos (exponencial)
- **Objetivo**: Minimizar tempo total respeitando restrições

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para dúvidas ou suporte, abra uma issue no repositório.

---

**Desenvolvido como parte do Trabalho de Conclusão de Curso (TCC)**