# Arquitetura

Objetivo: estudar recursos inteiros. critérios explícitos.

HTTP -> validação -> motor C + WebAssembly -> JSON.

O motor C em engine/allocation.c usa uint64_t para produtos e comparações de quocientes. Hamilton distribui partes inteiras e depois os maiores restos; D’Hondt escolhe iterativamente a maior média por multiplicação cruzada. IDs ordenados em ASCII resolvem empates. Não existe aritmética de ponto flutuante no motor. Cada chamada usa uma instância WASM nova com buffers fixos; a ABI não é exposta ao cliente. O build também compila e executa testes C nativos.

A soma distribuída é exatamente units. Pesos são estritamente positivos. Quotas são devolvidas como numerador/denominador, sem arredondamento decimal. Hamilton respeita quotas inferior/superior; D’Hondt não promete essa propriedade. Os métodos podem divergir. Isso é distribuição de recursos abstratos, não um critério universal de justiça. A comparação calcula ambos independentemente do method válido enviado.

server/http.mjs cuida de leitura limitada, headers, erros e OpenAPI. server/service.mjs define operações/contratos. server/meta.mjs contém exemplos sintéticos. app/playground.tsx é apenas cliente HTTP. tests inclui casos de domínio e integração real.

Não existem filas, banco, cron ou integrações sem função no domínio. Nenhuma persistência é prometida. 500 cenários determinísticos verificam conservação; Hamilton também verifica limites de quota. Casos máximos ultrapassam produtos de 32 bits e continuam corretos. Há verificações C nativas no build.
