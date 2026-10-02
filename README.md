# Servo Informática — catálogo

Loja de notebooks da Servo Informática: home, categorias, marcas, ficha técnica, busca, comparação e carrinho. O estoque fica no PostgreSQL e a API expõe o mesmo catálogo.

## Subir

```bash
npm install
npm run db
```

Em outro terminal:

```bash
npx prisma migrate dev
npm run db:seed
npm run dev
```

O Postgres local sobe em `127.0.0.1:5433` com os dados em `.data/`. Se o Docker estiver disponível, `docker compose up -d` usa o mesmo endereço.

## API

- `GET /api/products`
- `GET /api/products/[slug]`
- `GET /api/categories`
- `GET /api/brands`

Filtros na listagem: `q`, `marca`, `categoria`, `tela`, `peso`, `processador`, `ram`, `ssd`, `gpu`, `finalidade`, `estoque`, `oferta`, `lancamento`, `min`, `max`, `ordem`.

## Admin

Acesse `/admin`. No primeiro acesso, a tela de login cria o administrador (e-mail e senha).

Dali dá para criar e editar notebooks, marcas, categorias e estoque. Produto desativado some da loja. Duplicar cria uma cópia oculta, com estoque zerado.

## Configurações

O `.env` só guarda `DATABASE_URL`. Todo o resto fica em `/admin/configuracoes` (tabela `Setting`):

- dados da loja: telefone, WhatsApp, e-mail, horário, endereço de retirada;
- Asaas: ambiente (sandbox/produção), chave da API, URL e token do webhook, teste de conexão;
- acesso: e-mail e senha do administrador (trocar a senha encerra todas as sessões).

As fotos do catálogo são ilustrativas até o cadastro das imagens oficiais de cada notebook.

## Produção atrás do Nginx

Login, logout, bloqueio do `/admin` e a URL do webhook no painel usam o domínio que o Nginx repassa. Sem estes headers o app só enxerga `localhost:3000` e redireciona para lá:

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```
