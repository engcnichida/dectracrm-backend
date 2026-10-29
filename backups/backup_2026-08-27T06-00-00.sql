--
-- PostgreSQL database dump
--

\restrict I9pxhJvfXaQ96m9TbzYRr7AfZmRypfbM6DU7UOQYgmSggMFnP1Ae78Wv7p8TEQD

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: customers_status_enum; Type: TYPE; Schema: public; Owner: dectra
--

CREATE TYPE public.customers_status_enum AS ENUM (
    'ATIVO',
    'INATIVO',
    'IMPLANTACAO'
);


ALTER TYPE public.customers_status_enum OWNER TO dectra;

--
-- Name: opportunities_pipelinestage_enum; Type: TYPE; Schema: public; Owner: dectra
--

CREATE TYPE public.opportunities_pipelinestage_enum AS ENUM (
    'LEAD_CAPTURADO',
    'QUALIFICACAO',
    'REUNIAO',
    'PROPOSTA_ENVIADA',
    'NEGOCIACAO',
    'FECHADO_GANHO',
    'FECHADO_PERDIDO',
    'PERDIDO'
);


ALTER TYPE public.opportunities_pipelinestage_enum OWNER TO dectra;

--
-- Name: payables_status_enum; Type: TYPE; Schema: public; Owner: dectra
--

CREATE TYPE public.payables_status_enum AS ENUM (
    'PENDENTE',
    'PAGO',
    'PARCIAL',
    'ATRASADO',
    'CANCELADO'
);


ALTER TYPE public.payables_status_enum OWNER TO dectra;

--
-- Name: receivables_status_enum; Type: TYPE; Schema: public; Owner: dectra
--

CREATE TYPE public.receivables_status_enum AS ENUM (
    'PENDENTE',
    'RECEBIDO',
    'ATRASADO',
    'CANCELADO'
);


ALTER TYPE public.receivables_status_enum OWNER TO dectra;

--
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: dectra
--

CREATE TYPE public.users_role_enum AS ENUM (
    'ADMIN',
    'GERENTE',
    'VENDEDOR',
    'FINANCEIRO',
    'OPERACIONAL'
);


ALTER TYPE public.users_role_enum OWNER TO dectra;

--
-- Name: users_status_enum; Type: TYPE; Schema: public; Owner: dectra
--

CREATE TYPE public.users_status_enum AS ENUM (
    'PENDENTE',
    'ATIVO',
    'BLOQUEADO'
);


ALTER TYPE public.users_status_enum OWNER TO dectra;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alert_subscribers; Type: TABLE; Schema: public; Owner: dectra
--

CREATE TABLE public.alert_subscribers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" uuid NOT NULL,
    "receivePaymentConfirmations" boolean DEFAULT true NOT NULL,
    "receiveDueDateReminders" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.alert_subscribers OWNER TO dectra;

--
-- Name: backups; Type: TABLE; Schema: public; Owner: dectra
--

CREATE TABLE public.backups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    filename character varying(255) NOT NULL,
    filepath character varying(500) NOT NULL,
    "sizeBytes" bigint NOT NULL,
    type character varying(20) DEFAULT 'manual'::character varying NOT NULL,
    status character varying(20) DEFAULT 'SUCCESS'::character varying NOT NULL,
    "errorMessage" text,
    "durationMs" integer,
    "triggeredBy" character varying(100),
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.backups OWNER TO dectra;

--
-- Name: cash_flow_forecasts; Type: TABLE; Schema: public; Owner: dectra
--

CREATE TABLE public.cash_flow_forecasts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    description character varying(100) NOT NULL,
    type character varying(20) NOT NULL,
    amount numeric(10,2) NOT NULL,
    "forecastDate" date NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    "isRecurring" boolean DEFAULT false NOT NULL,
    "expenseId" uuid,
    status character varying(20) DEFAULT 'PREVISTO'::character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.cash_flow_forecasts OWNER TO dectra;

--
-- Name: contracts; Type: TABLE; Schema: public; Owner: dectra
--

CREATE TABLE public.contracts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "customerId" character varying NOT NULL,
    type character varying(50) NOT NULL,
    "totalValue" numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    "startDate" date NOT NULL,
    "billingDate" date,
    "endDate" date,
    status character varying(50) DEFAULT 'ATIVO'::character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "paymentCondition" character varying(50),
    title character varying(100),
    installments integer DEFAULT 1,
    frequency character varying(20) DEFAULT 'MENSAL'::character varying
);


ALTER TABLE public.contracts OWNER TO dectra;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: dectra
--

CREATE TABLE public.customers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(300),
    "companyName" character varying(300),
    cnpj character varying(18),
    cpf character varying(14),
    address text,
    city character varying(100),
    state character varying(2),
    cep character varying(9),
    "contactName" character varying(200),
    "contactPhone" character varying(50),
    "contactEmail" character varying(100),
    status public.customers_status_enum DEFAULT 'ATIVO'::public.customers_status_enum NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.customers OWNER TO dectra;

--
-- Name: expense_types; Type: TABLE; Schema: public; Owner: dectra
--

CREATE TABLE public.expense_types (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    "isCACComponent" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    classification character varying(20) DEFAULT 'DESPESA'::character varying NOT NULL
);


ALTER TABLE public.expense_types OWNER TO dectra;

--
-- Name: expenses; Type: TABLE; Schema: public; Owner: dectra
--

CREATE TABLE public.expenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    description character varying(100) NOT NULL,
    amount numeric(10,2) NOT NULL,
    "expenseDate" date NOT NULL,
    status character varying(20) DEFAULT 'PENDENTE'::character varying NOT NULL,
    notes text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "dueDate" date,
    "recurrenceCount" integer,
    "recurrenceEndDate" date,
    "expenseTypeId" uuid,
    "isRecurring" boolean DEFAULT false NOT NULL,
    "recurrencePeriod" character varying(20)
);


ALTER TABLE public.expenses OWNER TO dectra;

--
-- Name: opportunities; Type: TABLE; Schema: public; Owner: dectra
--

CREATE TABLE public.opportunities (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(300) NOT NULL,
    company character varying(300),
    "contactName" character varying(200),
    "contactPhone" character varying(50),
    "contactEmail" character varying(100),
    "estimatedValue" numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    "expectedCloseDate" date,
    description text,
    "pipelineStage" public.opportunities_pipelinestage_enum DEFAULT 'LEAD_CAPTURADO'::public.opportunities_pipelinestage_enum NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "customerId" uuid
);


ALTER TABLE public.opportunities OWNER TO dectra;

--
-- Name: payable_categories; Type: TABLE; Schema: public; Owner: dectra
--

CREATE TABLE public.payable_categories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    color character varying(20)
);


ALTER TABLE public.payable_categories OWNER TO dectra;

--
-- Name: payables; Type: TABLE; Schema: public; Owner: dectra
--

CREATE TABLE public.payables (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    description text NOT NULL,
    amount numeric(12,2) NOT NULL,
    "paidAmount" numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    "dueDate" date NOT NULL,
    "paidDate" date,
    status public.payables_status_enum DEFAULT 'PENDENTE'::public.payables_status_enum NOT NULL,
    "categoryId" character varying,
    "supplierId" character varying,
    "paymentMethod" character varying(100),
    "referenceNumber" character varying(100),
    notes text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    category character varying(100),
    supplier character varying(200),
    recurrence character varying(50),
    "recurrenceCount" integer DEFAULT 1 NOT NULL,
    "recurrenceEndDate" date,
    "isRecurring" boolean DEFAULT false NOT NULL,
    "recurringExpenseId" uuid
);


ALTER TABLE public.payables OWNER TO dectra;

--
-- Name: receivables; Type: TABLE; Schema: public; Owner: dectra
--

CREATE TABLE public.receivables (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "contractId" character varying NOT NULL,
    description text NOT NULL,
    amount numeric(12,2) NOT NULL,
    "paidAmount" numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    "dueDate" date NOT NULL,
    "paidAt" date,
    status public.receivables_status_enum DEFAULT 'PENDENTE'::public.receivables_status_enum NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.receivables OWNER TO dectra;

--
-- Name: recurring_expenses; Type: TABLE; Schema: public; Owner: dectra
--

CREATE TABLE public.recurring_expenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    description character varying(100) NOT NULL,
    category character varying(50) NOT NULL,
    "estimatedAmount" numeric(10,2) NOT NULL,
    "dueDay" integer NOT NULL,
    status character varying(20) DEFAULT 'ATIVO'::character varying NOT NULL,
    notes text,
    "lastGenerated" date,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.recurring_expenses OWNER TO dectra;

--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: dectra
--

CREATE TABLE public.suppliers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(300) NOT NULL,
    cnpj character varying(18),
    phone character varying(50),
    email character varying(100),
    address text,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.suppliers OWNER TO dectra;

--
-- Name: user_presets; Type: TABLE; Schema: public; Owner: dectra
--

CREATE TABLE public.user_presets (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    page character varying(50) NOT NULL,
    "periodType" character varying(20) NOT NULL,
    "startDate" date,
    "endDate" date,
    "userId" uuid,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_presets OWNER TO dectra;

--
-- Name: users; Type: TABLE; Schema: public; Owner: dectra
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    name character varying,
    role public.users_role_enum DEFAULT 'OPERACIONAL'::public.users_role_enum NOT NULL,
    status public.users_status_enum DEFAULT 'PENDENTE'::public.users_status_enum NOT NULL,
    permissions jsonb,
    "approvalCode" character varying,
    "approvalCodeExpiresAt" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO dectra;

--
-- Data for Name: alert_subscribers; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.alert_subscribers (id, "userId", "receivePaymentConfirmations", "receiveDueDateReminders", "createdAt") FROM stdin;
\.


--
-- Data for Name: backups; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.backups (id, filename, filepath, "sizeBytes", type, status, "errorMessage", "durationMs", "triggeredBy", "createdAt") FROM stdin;
dd885430-73cc-41ed-9280-78b3e93d4d72	backup_2026-08-25T06-00-00.sql	D:\\dectracrm-cloud\\backend\\backups\\backup_2026-08-25T06-00-00.sql	25892	automatic	SUCCESS	\N	686	system	2026-08-25 06:00:00.248833
49d64793-e1a0-4a1c-b2fa-23f9482230a0	in_progress		0	automatic	IN_PROGRESS	\N	\N	system	2026-08-27 06:00:00.086297
\.


--
-- Data for Name: cash_flow_forecasts; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.cash_flow_forecasts (id, description, type, amount, "forecastDate", month, year, "isRecurring", "expenseId", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: contracts; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.contracts (id, "customerId", type, "totalValue", "startDate", "billingDate", "endDate", status, "createdAt", "updatedAt", "paymentCondition", title, installments, frequency) FROM stdin;
7125621f-38dd-4df5-94e2-233fc5bbce86	bf970136-10ef-42da-a8b3-893c92786c80	SERVICO	15000.00	2026-08-25	2026-08-15	\N	ATIVO	2026-08-24 19:55:07.903207	2026-08-24 19:55:30.157567	PARCELADO	SER-26-08-24-8880	2	MENSAL
c3c183bf-ae7b-42e8-83e6-177d169bdbd2	172c2892-9d41-4918-9fff-0d316f6a3e26	SERVICO	1200.00	2026-08-26	2026-08-15	\N	ATIVO	2026-08-26 10:23:15.960099	2026-08-26 10:23:52.727568	PARCELADO	SER-26-08-25-1894	2	MENSAL
08c4aa98-26bc-4913-846d-0a941b890bc6	1b7acd7b-33a8-463e-85db-beb93f9b730b	SERVICO	12000.00	2026-08-26	2026-08-10	\N	ATIVO	2026-08-26 23:32:10.305746	2026-08-26 23:32:10.305746	À VISTA	SER-26-08-25-1181	1	MENSAL
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.customers (id, name, "companyName", cnpj, cpf, address, city, state, cep, "contactName", "contactPhone", "contactEmail", status, "createdAt", "updatedAt") FROM stdin;
bf970136-10ef-42da-a8b3-893c92786c80	Roberto CEO	Inovação Digital S.A.	\N	\N	\N	\N	\N	\N	Roberto CEO	(31) 91234-5678	roberto@inovacaodigital.com.br	ATIVO	2026-08-24 19:55:07.879786	2026-08-24 19:55:07.879786
172c2892-9d41-4918-9fff-0d316f6a3e26	José	SolarSolar	\N	\N	\N	\N	\N	\N	José	(62) 90000-0000	contato@solar.com	ATIVO	2026-08-26 10:23:15.946868	2026-08-26 10:23:15.946868
1b7acd7b-33a8-463e-85db-beb93f9b730b	Ana Gerente	Tech Solutions Brasil	\N	\N	\N	\N	\N	\N	Ana Gerente	(21) 99876-5432	ana.gerente@techsolutions.com.br	ATIVO	2026-08-26 23:32:10.273494	2026-08-26 23:32:10.273494
\.


--
-- Data for Name: expense_types; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.expense_types (id, name, description, "isCACComponent", "createdAt", "updatedAt", classification) FROM stdin;
260960bf-4e4b-4dd4-85f3-12974d4f533b	Marketing	\N	t	2026-08-24 20:21:07.113573	2026-08-24 20:21:07.113573	DESPESA
04266c5d-a848-41ed-b501-826835af88c6	Despesas Ordinárias Administrativas	\N	f	2026-08-24 20:21:49.368911	2026-08-24 20:21:49.368911	DESPESA
79f8bf2e-4a2d-4cbe-b576-7aecbeff4780	Despesas com Eventos	\N	t	2026-08-24 20:22:04.894666	2026-08-24 20:22:04.894666	DESPESA
20788d64-3464-4f05-b69a-04a548dd5f16	Despesas de Tecnologia Embarcada	\N	f	2026-08-24 20:21:29.731857	2026-08-24 20:22:18.119074	CUSTO
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.expenses (id, description, amount, "expenseDate", status, notes, "createdAt", "updatedAt", "dueDate", "recurrenceCount", "recurrenceEndDate", "expenseTypeId", "isRecurring", "recurrencePeriod") FROM stdin;
1af9f809-86e9-4b4f-9898-6cbbfbd4d0c0	Contador	400.00	2026-08-15	PENDENTE	\N	2026-08-24 20:22:55.856536	2026-08-24 20:22:55.856536	2026-08-15	\N	\N	04266c5d-a848-41ed-b501-826835af88c6	f	\N
1be1e96f-c324-4625-8c28-03942cdee52d	Gestão de Marketing	1350.00	2026-08-15	PENDENTE	\N	2026-08-24 20:30:53.491362	2026-08-24 20:30:53.491362	2026-08-15	\N	\N	260960bf-4e4b-4dd4-85f3-12974d4f533b	f	\N
\.


--
-- Data for Name: opportunities; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.opportunities (id, title, company, "contactName", "contactPhone", "contactEmail", "estimatedValue", "expectedCloseDate", description, "pipelineStage", "createdAt", "updatedAt", "customerId") FROM stdin;
eea28e79-b301-447c-84bd-d4e4552279cb	Oportunidade: engenharia	Inovação Digital S.A.	Roberto CEO	(31) 91234-5678	roberto@inovacaodigital.com.br	25000.00	\N	\N	FECHADO_GANHO	2026-08-24 19:40:26.272662	2026-08-24 19:55:07.928089	\N
2d006590-3bf4-443c-80f6-763538bfd090	Intersolar Contatos	SolarSolar	José	(62) 90000-0000	contato@solar.com	1200.00	\N	\N	FECHADO_GANHO	2026-08-26 10:21:31.562927	2026-08-26 10:23:15.975764	\N
d1c6cb59-35ee-4150-9d7b-835da02b3b0c	Oportunidade: Oem	Inovação Digital S.A.	Roberto CEO	(31) 91234-5678	roberto@inovacaodigital.com.br	25000.00	\N	\N	QUALIFICACAO	2026-08-24 18:59:00.69003	2026-08-26 23:31:41.122823	\N
3c8bf7b0-0d5e-40ba-a2dd-d9424708e033	Parceria Potencial: Oem	Tech Solutions Brasil	Ana Gerente	(21) 99876-5432	ana.gerente@techsolutions.com.br	12000.00	\N	\N	FECHADO_GANHO	2026-08-24 18:59:00.683435	2026-08-26 23:32:10.338338	\N
23bc46cf-e302-4dbc-9726-5cf39e49a83b	Contato via Busca: Oem	Empresa Oem Ltda	Carlos Diretor	(11) 98765-4321	contato@empresaoem.com.br	5000.00	\N	\N	LEAD_CAPTURADO	2026-08-24 18:59:00.654787	2026-08-24 18:59:00.654787	\N
\.


--
-- Data for Name: payable_categories; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.payable_categories (id, name, description, color) FROM stdin;
\.


--
-- Data for Name: payables; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.payables (id, description, amount, "paidAmount", "dueDate", "paidDate", status, "categoryId", "supplierId", "paymentMethod", "referenceNumber", notes, "createdAt", "updatedAt", category, supplier, recurrence, "recurrenceCount", "recurrenceEndDate", "isRecurring", "recurringExpenseId") FROM stdin;
5978bac0-866a-4feb-a175-5ed311bf0377	Gerador de ortomosaicos	250.00	0.00	2026-10-30	2026-08-23	PAGO	\N	\N	\N	\N	\N	2026-08-23 19:29:47.756546	2026-08-23 19:41:15.191372	OPERACIONAL	Agisoft	TRIMESTRAL	4	\N	f	\N
2029a6a8-e0c6-4a26-896a-c69e9e5677c6	Contador	400.00	0.00	2026-08-15	\N	PENDENTE	\N	\N	\N	\N	Gerado automaticamente a partir da despesa ID: 1af9f809-86e9-4b4f-9898-6cbbfbd4d0c0	2026-08-24 20:22:55.867033	2026-08-24 20:22:55.867033	Outros	\N	\N	1	\N	f	1af9f809-86e9-4b4f-9898-6cbbfbd4d0c0
1cebe107-a7eb-4fb3-9c0d-cdfd54121499	Intersolar	7500.00	0.00	2026-08-15	\N	PAGO	\N	\N	\N	\N	\N	2026-08-26 13:52:48.073716	2026-08-26 13:52:48.073716	OPERACIONAL	The Smarter	UNICA	1	\N	f	\N
c1936bc1-3831-419b-b41f-2fc4ed3782cd	Gestão de Marketing	1350.00	0.00	2026-08-15	2026-08-26	PAGO	\N	\N	\N	\N	Gerado automaticamente a partir da despesa ID: 1be1e96f-c324-4625-8c28-03942cdee52d	2026-08-24 20:30:53.530068	2026-08-26 13:52:53.332787	Outros	\N	\N	1	\N	f	1be1e96f-c324-4625-8c28-03942cdee52d
\.


--
-- Data for Name: receivables; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.receivables (id, "contractId", description, amount, "paidAmount", "dueDate", "paidAt", status, "createdAt", "updatedAt") FROM stdin;
b67fe196-aad0-4636-8057-3a8d23230c08	7125621f-38dd-4df5-94e2-233fc5bbce86	Parcela 2/2 - SER-26-08-24-8880	7500.00	0.00	2026-09-15	\N	PENDENTE	2026-08-24 19:55:30.166103	2026-08-24 19:55:30.166103
cfc1642a-6e41-4d1e-8398-51dac634663d	7125621f-38dd-4df5-94e2-233fc5bbce86	Parcela 1/2 - SER-26-08-24-8880	7500.00	0.00	2026-08-15	2026-08-24	RECEBIDO	2026-08-24 19:55:30.166103	2026-08-24 19:55:30.166103
24fa19f6-218f-4f8d-8a3c-2b4237b1d7a2	c3c183bf-ae7b-42e8-83e6-177d169bdbd2	Parcela 1/2 - SER-26-08-25-1894	600.00	0.00	2026-08-15	\N	PENDENTE	2026-08-26 10:23:15.965645	2026-08-26 10:23:15.965645
4fea0966-83a4-4bb5-86a0-8087fd852bef	c3c183bf-ae7b-42e8-83e6-177d169bdbd2	Parcela 2/2 - SER-26-08-25-1894	600.00	0.00	2026-09-15	\N	PENDENTE	2026-08-26 10:23:15.965645	2026-08-26 10:23:15.965645
5e65dd4d-9f66-4435-abc6-0a994e5285f1	08c4aa98-26bc-4913-846d-0a941b890bc6	Parcela 1/1 - SER-26-08-25-1181	12000.00	0.00	2026-08-10	\N	PENDENTE	2026-08-26 23:32:10.316463	2026-08-26 23:32:10.316463
\.


--
-- Data for Name: recurring_expenses; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.recurring_expenses (id, description, category, "estimatedAmount", "dueDay", status, notes, "lastGenerated", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.suppliers (id, name, cnpj, phone, email, address, "isActive") FROM stdin;
\.


--
-- Data for Name: user_presets; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.user_presets (id, name, page, "periodType", "startDate", "endDate", "userId", "isDefault", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.users (id, email, password, name, role, status, permissions, "approvalCode", "approvalCodeExpiresAt", "createdAt", "updatedAt") FROM stdin;
b8dad380-5338-4e02-b12f-4dfc1301c9aa	cnichida@gmail.com	$2b$10$2yFGkgv03is7to2gyV4bLuWnCh/G7mHL7ngOyPblUuQM1FeJ4RH5K	Cleiber Teste	OPERACIONAL	ATIVO	{"kpis": {"edit": true, "view": true}, "kanban": {"edit": true, "view": true}, "clientes": {"edit": true, "view": true}, "contratos": {"edit": true, "view": true}, "dashboard": {"edit": true, "view": true}, "contas_pagar": {"edit": true, "view": true}, "contas_receber": {"edit": true, "view": true}, "dashboard_financeiro": {"edit": true, "view": true}}	\N	\N	2026-08-09 23:51:13.690512	2026-08-18 18:02:28.421494
e509d7cc-1437-4936-90c4-360a6505a3d7	admin@dectra.com	$2b$10$I3MoJaewmhp/eCazTpBOUuIjZLKqQsOFEnAcvPyrqemoP6A9WNx72	Administrador	ADMIN	ATIVO	{"kpis": {"edit": true, "view": true}, "kanban": {"edit": true, "view": true}, "clientes": {"edit": true, "view": true}, "contratos": {"edit": true, "view": true}, "dashboard": {"edit": true, "view": true}, "contas_pagar": {"edit": true, "view": true}, "contas_receber": {"edit": true, "view": true}, "dashboard_financeiro": {"edit": true, "view": true}}	\N	\N	2026-08-09 23:21:46.562931	2026-08-18 18:02:12.012212
\.


--
-- Name: customers PK_133ec679a801fab5e070f73d3ea; Type: CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY (id);


--
-- Name: contracts PK_2c7b8f3a7b1acdd49497d83d0fb; Type: CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT "PK_2c7b8f3a7b1acdd49497d83d0fb" PRIMARY KEY (id);


--
-- Name: payables PK_33adb2ad800095b1f556f01b2c3; Type: CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.payables
    ADD CONSTRAINT "PK_33adb2ad800095b1f556f01b2c3" PRIMARY KEY (id);


--
-- Name: user_presets PK_38b31878332ede596cfd5f204ba; Type: CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.user_presets
    ADD CONSTRAINT "PK_38b31878332ede596cfd5f204ba" PRIMARY KEY (id);


--
-- Name: alert_subscribers PK_471f44f4c9647f6f5eb0a5e452b; Type: CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.alert_subscribers
    ADD CONSTRAINT "PK_471f44f4c9647f6f5eb0a5e452b" PRIMARY KEY (id);


--
-- Name: opportunities PK_4bd9cd12ddc0ff48a5a97ddebce; Type: CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT "PK_4bd9cd12ddc0ff48a5a97ddebce" PRIMARY KEY (id);


--
-- Name: expense_types PK_84c519d5ded69fbf55ab41910df; Type: CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.expense_types
    ADD CONSTRAINT "PK_84c519d5ded69fbf55ab41910df" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: suppliers PK_b70ac51766a9e3144f778cfe81e; Type: CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT "PK_b70ac51766a9e3144f778cfe81e" PRIMARY KEY (id);


--
-- Name: receivables PK_d77a2c19436083a2039cf06f1ec; Type: CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.receivables
    ADD CONSTRAINT "PK_d77a2c19436083a2039cf06f1ec" PRIMARY KEY (id);


--
-- Name: payable_categories PK_fbc92edd02369f2a636628587be; Type: CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.payable_categories
    ADD CONSTRAINT "PK_fbc92edd02369f2a636628587be" PRIMARY KEY (id);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: expense_types UQ_9c3e1797ec3f3327256ba19281f; Type: CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.expense_types
    ADD CONSTRAINT "UQ_9c3e1797ec3f3327256ba19281f" UNIQUE (name);


--
-- Name: backups backups_pkey; Type: CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.backups
    ADD CONSTRAINT backups_pkey PRIMARY KEY (id);


--
-- Name: cash_flow_forecasts cash_flow_forecasts_pkey; Type: CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.cash_flow_forecasts
    ADD CONSTRAINT cash_flow_forecasts_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: recurring_expenses recurring_expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.recurring_expenses
    ADD CONSTRAINT recurring_expenses_pkey PRIMARY KEY (id);


--
-- Name: expenses FK_5b174bffa2ac95ef4ffced328e5; Type: FK CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "FK_5b174bffa2ac95ef4ffced328e5" FOREIGN KEY ("expenseTypeId") REFERENCES public.expense_types(id);


--
-- Name: cash_flow_forecasts FK_9aaa4f057b06f38f1e4335c7e74; Type: FK CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.cash_flow_forecasts
    ADD CONSTRAINT "FK_9aaa4f057b06f38f1e4335c7e74" FOREIGN KEY ("expenseId") REFERENCES public.expenses(id);


--
-- Name: alert_subscribers FK_df9e8b8df1020af2febeef9b8ff; Type: FK CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.alert_subscribers
    ADD CONSTRAINT "FK_df9e8b8df1020af2febeef9b8ff" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- Name: opportunities FK_e2c4f44d798310be0090da56567; Type: FK CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT "FK_e2c4f44d798310be0090da56567" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict I9pxhJvfXaQ96m9TbzYRr7AfZmRypfbM6DU7UOQYgmSggMFnP1Ae78Wv7p8TEQD

