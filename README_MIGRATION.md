## Configurando o novo Supabase

1. Crie uma nova conta e projeto no [Supabase](https://supabase.com/).
2. No painel do seu novo projeto, vá até o **SQL Editor**.
3. Copie o conteúdo do arquivo `supabase-setup.sql` que criei na raiz do projeto, cole no editor e execute (botão Run). Isso vai recriar as tabelas, as permissões de segurança (RLS) e o **Storage Bucket** para as imagens.
4. Vá em **Project Settings -> API**.
5. Copie a `Project URL` e coloque no painel do AI Studio como a variável `VITE_SUPABASE_URL`.
6. Copie a `anon public` key e coloque como `VITE_SUPABASE_ANON_KEY`.
