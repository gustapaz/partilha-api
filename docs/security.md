# Segurança e limites

Até 50 participantes, pesos inteiros de 1 a 1.000.000, 0 a 10.000 unidades e 32 KiB por JSON. Os métodos podem dar resultados distintos e não representam uma regra universal de justiça.

O stream conta bytes reais e cancela ao ultrapassar 32 KiB, mesmo sem Content-Length. O servidor valida tipos, propriedades e limites. Não aceita corpo comprimido, execução de código do usuário ou arquivos persistidos.

Origin de navegador deve coincidir com o serviço; clientes sem Origin continuam aceitos. Isso não é autenticação nem impede chamadas por scripts externos. Não há cookies, contas ou credenciais públicas de administrador.

Respostas incluem no-store, nosniff, Referrer-Policy e request IDs. Erros não expõem stacks ou entradas. A aplicação não registra payloads; a infraestrutura pode registrar metadados. Use somente dados sintéticos, nunca informações pessoais, credenciais ou políticas reais sensíveis.

Não há rate limit global ou defesa DDoS própria. Trabalho e memória por chamada são limitados; cotas e disponibilidade dependem do provedor. Nenhum cartão, faturamento, trial ou plano pago foi ativado. Sem SLA ou garantia de gratuidade permanente.

O motor C em engine/allocation.c usa uint64_t para produtos e comparações de quocientes. Hamilton distribui partes inteiras e depois os maiores restos; D’Hondt escolhe iterativamente a maior média por multiplicação cruzada. IDs ordenados em ASCII resolvem empates. Não existe aritmética de ponto flutuante no motor. Cada chamada usa uma instância WASM nova com buffers fixos; a ABI não é exposta ao cliente. O build também compila e executa testes C nativos.

Os testes comprovam comportamentos delimitados; não certificam ausência universal de vulnerabilidades.
