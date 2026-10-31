# Partilha API

Distribua unidades indivisíveis proporcionalmente, usando maiores restos ou maiores médias. Cálculos inteiros em C, compilados para WebAssembly e executados no servidor.

**Motor: C + WebAssembly.**

[Demo](https://partilha-api-gustapaz.starrylinen.chatgpt.site) · [Swagger](https://partilha-api-gustapaz.starrylinen.chatgpt.site/docs.html) · [OpenAPI](https://partilha-api-gustapaz.starrylinen.chatgpt.site/api/openapi.json)

## Recursos

Compara Hamilton (maiores restos) e D’Hondt (maiores médias). A soma distribuída é sempre exata. Quocientes são comparados por multiplicação cruzada, sem ponto flutuante. IDs ASCII resolvem empates.

Os exemplos são sintéticos. O motor, as regras e as respostas são reais no servidor. Não há serviços externos simulando o processamento.

## Executar localmente

Node.js 24, npm e Python 3. O compilador Zig é instalado gratuitamente pelo pacote ziglang 0.15.2; alternativamente, aponte ZIG_BIN para um executável Zig 0.15.2 instalado da fonte oficial.

```sh
python -m pip install ziglang==0.15.2
npm ci
npm run build
npm start -- --port 5211
```

Abra http://127.0.0.1:5211 e /docs.html. Não precisa de conta cloud, cartão, segredo ou banco. O serviço é stateless: nada precisa sobreviver à requisição, portanto não existem migrações ou persistência prometida.

```sh
npm run build:engine
npm run check
npm run typecheck
npm test
npm run smoke -- http://127.0.0.1:5211
```

28 testes passam sobre o motor real e integração HTTP via TCP, sem mocks do domínio. 500 cenários determinísticos verificam conservação; Hamilton também verifica limites de quota. Casos máximos ultrapassam produtos de 32 bits e continuam corretos. Há verificações C nativas no build. A CI instala do lockfile, constrói o motor, verifica formatação e tipos do adaptador/interface, executa testes e compila o Worker. O smoke verifica os exemplos e as duas operações no runtime local ou público.

## API e exemplos

```sh
curl https://partilha-api-gustapaz.starrylinen.chatgpt.site/api/health
curl -X POST https://partilha-api-gustapaz.starrylinen.chatgpt.site/api/v1/allocate -H 'Content-Type: application/json' --data-binary @examples/requests/example-1.json
curl -X POST https://partilha-api-gustapaz.starrylinen.chatgpt.site/api/v1/compare -H 'Content-Type: application/json' --data-binary @examples/requests/example-1.json
```

GET /api/v1/examples oferece três entradas sintéticas executáveis. O health executa uma operação real no motor antes de retornar engine_check:true. Todos os endpoints são públicos, sem identidade ou recursos privados persistidos.

Erros usam application/problem+json e request_id, sem stack trace. JSON/UTF-8 inválido: 400; Origin de navegador diferente: 403; rota desconhecida: 404; corpo acima de 32 KiB: 413; mídia/codificação incorreta: 415; contrato inválido: 422.

## Semântica

A soma distribuída é exatamente units. Pesos são estritamente positivos. Quotas são devolvidas como numerador/denominador, sem arredondamento decimal. Hamilton respeita quotas inferior/superior; D’Hondt não promete essa propriedade. Os métodos podem divergir. Isso é distribuição de recursos abstratos, não um critério universal de justiça. A comparação calcula ambos independentemente do method válido enviado.

Até 50 participantes, pesos inteiros de 1 a 1.000.000, 0 a 10.000 unidades e 32 KiB por JSON. Os métodos podem dar resultados distintos e não representam uma regra universal de justiça.

## Arquitetura e operação

[Arquitetura](docs/architecture.md) · [Segurança](docs/security.md)

O núcleo está em engine/allocation.c, server/core.mjs, server/service.mjs. Vinext/React fornece somente o adaptador Worker e a documentação técnica; as regras não são executadas no navegador. Entradas e resultados não são gravados pela aplicação; a página mantém a resposta apenas em memória.

Demo hospedada em Sites, sem cartão, faturamento, trial ou plano pago ativado. GitHub hospeda código e CI; Pages não executa a API. Cotas e disponibilidade dependem da hospedagem, sem SLA ou promessa de gratuidade permanente. Há limite de trabalho por chamada, mas não rate limit global próprio. Use somente dados sintéticos.

Nenhuma variável secreta é necessária. Credenciais de Git/publicação ficam fora do repositório. Consulte .env.example.

## Licença

Código do projeto sob MIT. Dependências mantêm suas licenças. Swagger UI conserva LICENSE e NOTICE em public/swagger; tooling Sites/Vinext preserva avisos em vendor e scripts/vite/sites-vite-plugin.LICENSE.
