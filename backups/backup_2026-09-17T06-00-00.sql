--
-- PostgreSQL database dump
--

\restrict mb3c7YCmP7Eki93clBzSKMJhJePauGbzehmJIQScNSwHrBj7sMXJ4AGk0UaHZqA

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

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
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
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
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
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
    "endDate" date,
    "billingDate" date,
    status character varying(50) DEFAULT 'ATIVO'::character varying NOT NULL,
    installments integer DEFAULT 1,
    frequency character varying(20) DEFAULT 'MENSAL'::character varying,
    "paymentCondition" character varying(50),
    title character varying(100),
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
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
    classification character varying(20) DEFAULT 'DESPESA'::character varying NOT NULL,
    "isCACComponent" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.expense_types OWNER TO dectra;

--
-- Name: expenses; Type: TABLE; Schema: public; Owner: dectra
--

CREATE TABLE public.expenses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    description character varying(100) NOT NULL,
    "expenseTypeId" uuid,
    amount numeric(10,2) NOT NULL,
    "expenseDate" date NOT NULL,
    "dueDate" date,
    status character varying(20) DEFAULT 'PENDENTE'::character varying NOT NULL,
    notes text,
    "isRecurring" boolean DEFAULT false NOT NULL,
    "recurrencePeriod" character varying(20),
    "recurrenceCount" integer,
    "recurrenceEndDate" date,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "generatesReceipt" boolean DEFAULT false NOT NULL,
    "autoConfirmOnDueDate" boolean DEFAULT false NOT NULL
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
    "customerId" uuid,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "pipelineStage" character varying(50) DEFAULT 'LEAD_CAPTURADO'::character varying NOT NULL,
    archived boolean DEFAULT false NOT NULL,
    "archivedAt" timestamp without time zone,
    "archiveReason" character varying(500)
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
    amount numeric(12,2) NOT NULL,
    "dueDate" date NOT NULL,
    category character varying(100),
    notes text,
    "recurringExpenseId" uuid,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "paidAt" date,
    "expenseId" uuid,
    "generatesReceipt" boolean DEFAULT false NOT NULL,
    description character varying(300) NOT NULL,
    status character varying(20) DEFAULT 'PENDENTE'::character varying NOT NULL,
    "paymentMethod" character varying(50)
);


ALTER TABLE public.payables OWNER TO dectra;

--
-- Name: receipts; Type: TABLE; Schema: public; Owner: dectra
--

CREATE TABLE public.receipts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    type character varying(20) NOT NULL,
    "receiptNumber" character varying(30) NOT NULL,
    description text NOT NULL,
    amount numeric(12,2) NOT NULL,
    "receiptDate" date NOT NULL,
    "issuerName" character varying(300) NOT NULL,
    "issuerDocument" character varying(20),
    "issuerAddress" character varying(300),
    "linkedEntityType" character varying(20),
    "linkedEntityId" uuid,
    status character varying(20) DEFAULT 'PENDENTE'::character varying NOT NULL,
    attachments text,
    notes text,
    "paymentMethod" character varying(100),
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    city character varying(100)
);


ALTER TABLE public.receipts OWNER TO dectra;

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
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    description character varying(100) NOT NULL,
    category character varying(50) NOT NULL,
    "estimatedAmount" numeric(10,2) NOT NULL,
    "dueDay" integer NOT NULL,
    status character varying(20) DEFAULT 'ATIVO'::character varying NOT NULL,
    notes text,
    "lastGenerated" date,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "generatesReceipt" boolean DEFAULT false NOT NULL,
    "autoConfirmOnDueDate" boolean DEFAULT false NOT NULL
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
613aadb6-fa41-4863-834a-4da4fd120a8a	backup_2026-09-02T06-00-00.sql	D:\\dectracrm-cloud\\backend\\backups\\backup_2026-09-02T06-00-00.sql	33539	automatic	SUCCESS	\N	686	system	2026-09-02 06:00:00.389339
79f98da2-b17a-42ad-9f0f-1cc1ca245f60	backup_2026-09-03T06-00-00.sql	D:\\dectracrm-cloud\\backend\\backups\\backup_2026-09-03T06-00-00.sql	37088	automatic	SUCCESS	\N	2407	system	2026-09-03 06:00:00.362007
efd75d33-96b2-4d1f-88f1-fef3cb20ee3f	backup_2026-09-10T06-00-00.sql	D:\\dectracrm-cloud\\backend\\backups\\backup_2026-09-10T06-00-00.sql	40528	automatic	SUCCESS	\N	924	system	2026-09-10 06:00:00.426703
8daade3d-bf6b-48a2-b0b9-32f333a9cf8c	backup_2026-09-16T06-00-00.sql	D:\\dectracrm-cloud\\backend\\backups\\backup_2026-09-16T06-00-00.sql	43334	automatic	SUCCESS	\N	894	system	2026-09-16 06:00:00.95788
f3370349-b586-4371-bf84-6c278227deb4	in_progress		0	automatic	IN_PROGRESS	\N	\N	system	2026-09-17 06:00:00.676535
\.


--
-- Data for Name: cash_flow_forecasts; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.cash_flow_forecasts (id, description, type, amount, "forecastDate", month, year, "isRecurring", "expenseId", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: contracts; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.contracts (id, "customerId", type, "totalValue", "startDate", "endDate", "billingDate", status, installments, frequency, "paymentCondition", title, "createdAt", "updatedAt") FROM stdin;
c6554c41-9341-4cd0-8620-782329e8b0f6	395f1a0f-934b-4d02-a96d-4cbffc2f91d4	SERVICO	3517.04	2025-09-02	\N	2025-09-10	ATIVO	1	MENSAL	À VISTA	UFV Lençóis Paulista I - 01/09/2025	2026-09-02 18:57:09.299297	2026-09-02 18:57:09.299297
24100dbc-59d8-4311-98d4-8e2d50dd48a1	395f1a0f-934b-4d02-a96d-4cbffc2f91d4	SERVICO	4116.00	2024-09-02	\N	2024-09-10	ATIVO	1	MENSAL	À VISTA	UFV Clareira Araçu (I-II) - 01/09/2024	2026-09-02 18:58:26.468695	2026-09-02 18:58:26.468695
1880bb8f-3b49-4dd0-9be7-b2aa15fbcd02	6c4bcad5-1612-44ed-a557-fde39cad1a76	SERVICO	7858.76	2025-02-21	\N	2025-02-10	ATIVO	1	MENSAL	À VISTA	UFV Araçu I - 20/02/2025	2026-09-02 23:32:37.87103	2026-09-02 23:32:37.87103
e6487940-e1ee-478e-b9cb-32655d0c40c4	6c4bcad5-1612-44ed-a557-fde39cad1a76	SERVICO	29955.88	2025-02-21	\N	2025-02-10	ATIVO	1	MENSAL	À VISTA	UFV Camarão Palmeiras (I-V) - 20/02/2025	2026-09-02 23:35:10.969089	2026-09-02 23:35:10.969089
e2152271-07d4-4def-bd99-99949beecd4d	395f1a0f-934b-4d02-a96d-4cbffc2f91d4	SERVICO	3338.16	2025-03-19	\N	2025-03-10	ATIVO	1	MENSAL	À VISTA	UFV Araçu IX - 18/03/2025	2026-09-02 23:37:21.726642	2026-09-02 23:37:21.726642
359b141c-3ef2-4359-b613-7839c480bdb2	395f1a0f-934b-4d02-a96d-4cbffc2f91d4	SERVICO	17029.49	2025-03-19	\N	2025-03-10	ATIVO	1	MENSAL	À VISTA	UFV Turvânia - 18/03/2025	2026-09-02 23:54:52.900373	2026-09-02 23:54:52.900373
85d8d39a-f835-4e8f-9492-41c6310c5fa5	395f1a0f-934b-4d02-a96d-4cbffc2f91d4	SERVICO	3710.35	2025-04-29	\N	2025-04-10	ATIVO	1	MENSAL	À VISTA	UFV Araçu III - 28/04/2025	2026-09-02 23:56:38.764527	2026-09-02 23:56:38.764527
cbfd13c7-eee5-4cb9-a067-b54c39774099	395f1a0f-934b-4d02-a96d-4cbffc2f91d4	SERVICO	5295.24	2025-04-29	\N	2025-04-10	ATIVO	1	MENSAL	À VISTA	UFV Araçu IV - 28/04/2025	2026-09-02 23:57:05.985479	2026-09-02 23:57:05.985479
9718e8ba-3ab9-4209-87d1-ce34c169be91	395f1a0f-934b-4d02-a96d-4cbffc2f91d4	SERVICO	6359.81	2026-09-10	\N	2026-09-10	ATIVO	1	MENSAL	À VISTA	UFV Machadinho Uruaçu - 09/09/2026	2026-09-10 14:36:00.789168	2026-09-10 14:36:00.789168
1332383d-073f-4474-b96a-09ea27a5a7ac	395f1a0f-934b-4d02-a96d-4cbffc2f91d4	SERVICO	8427.10	2025-04-29	\N	2025-04-29	ATIVO	1	MENSAL	À VISTA	UFV Bom Sucesso Palmeiras - 28/04/2025	2026-09-15 18:50:09.099398	2026-09-15 18:50:09.099398
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.customers (id, name, "companyName", cnpj, cpf, address, city, state, cep, "contactName", "contactPhone", "contactEmail", status, "createdAt", "updatedAt") FROM stdin;
395f1a0f-934b-4d02-a96d-4cbffc2f91d4	Sigma Engenharia	Sigma			\N	Goiânia	GO	\N	Gabriel Carrijo		gabriel@sigmaengenharia.com.br	ATIVO	2026-09-02 18:57:09.286805	2026-09-02 18:58:01.578342
6c4bcad5-1612-44ed-a557-fde39cad1a76	BC	BC Energia			\N	Goiânia	GO	\N	Paulo			ATIVO	2026-09-02 23:32:37.85261	2026-09-02 23:35:38.381806
\.


--
-- Data for Name: expense_types; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.expense_types (id, name, description, classification, "isCACComponent", "createdAt", "updatedAt") FROM stdin;
7560fc29-af3a-4370-9149-dc225fb23397	Marketing Digital	\N	DESPESA	t	2026-09-04 12:04:03.390283	2026-09-04 12:04:03.390283
262989d2-804e-4602-8f23-4be066e954dd	Administrativo	\N	DESPESA	f	2026-09-04 12:04:22.709685	2026-09-04 12:04:22.709685
8b3de120-583c-4d55-bc17-e9200b1a999e	Software/Plataforma de apoio	\N	DESPESA	f	2026-09-04 12:05:05.35494	2026-09-04 12:05:05.35494
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.expenses (id, description, "expenseTypeId", amount, "expenseDate", "dueDate", status, notes, "isRecurring", "recurrencePeriod", "recurrenceCount", "recurrenceEndDate", "createdAt", "updatedAt", "generatesReceipt", "autoConfirmOnDueDate") FROM stdin;
e816bcc5-4e0c-49d4-b8b8-30aaa82959df	Pró-Labores	262989d2-804e-4602-8f23-4be066e954dd	8400.00	2026-09-09	2026-09-09	PAGO	\N	t	MENSAL	12	\N	2026-09-15 18:03:26.578444	2026-09-15 23:32:54.182823	f	f
b3bf8872-3993-44b3-8abd-8b50f4d8d4a4	Conatbilidade	262989d2-804e-4602-8f23-4be066e954dd	400.00	2026-08-20	2026-09-20	PAGO	\N	t	MENSAL	12	\N	2026-09-04 12:17:16.060297	2026-09-15 23:32:59.573198	f	f
8baa7c3d-32c1-4d6d-93f8-bcbbb0909ff2	IWILL Design	7560fc29-af3a-4370-9149-dc225fb23397	1350.00	2026-09-15	2026-09-15	PAGO	\N	t	MENSAL	12	\N	2026-09-15 18:03:56.938158	2026-09-15 23:33:47.301836	f	f
\.


--
-- Data for Name: opportunities; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.opportunities (id, title, company, "contactName", "contactPhone", "contactEmail", "estimatedValue", "expectedCloseDate", description, "customerId", "createdAt", "updatedAt", "pipelineStage", archived, "archivedAt", "archiveReason") FROM stdin;
f2a1bb65-68de-4a24-8186-bdc5b01b2285	Pendente de agendamento de reunião	Mercury	Mario Morais	38 99841-9350		0.00	\N	\N	\N	2026-09-01 23:01:16.365597	2026-09-01 23:01:16.365597	LEAD_CAPTURADO	f	\N	\N
4571e1e5-c0cb-41a1-bd3e-22a17dda86c6	Pendente de retorno sobre o interesse da área técnica	Vale	Vanderleia	31 98223-4960		0.00	\N	\N	\N	2026-09-01 23:01:16.370552	2026-09-01 23:01:16.370552	LEAD_CAPTURADO	f	\N	\N
5678963c-b4c5-498b-801b-cfcde05d65d0	Aguradando o repasse da informação para o depto tecnico - Resp Eng Bruno	Loop	Eduardo	62 3911-5968		0.00	\N	\N	\N	2026-09-01 23:01:16.375365	2026-09-01 23:01:16.375365	LEAD_CAPTURADO	f	\N	\N
0a059928-64d9-428a-93c9-ac8304b440f8	Aguardando um agendamento de apresentação para o CREA BA	FG5	Fabrício	71 99996-0065		0.00	\N	\N	\N	2026-09-01 23:01:16.379822	2026-09-01 23:01:16.379822	LEAD_CAPTURADO	f	\N	\N
9d5618f3-eef2-4372-b7b8-b24cc3cffdde	Aguardando um agendamento de apresentação para CEO da empresa	CEL	Weslley	62 98121-8793		0.00	\N	\N	\N	2026-09-01 23:01:16.383777	2026-09-01 23:01:16.383777	LEAD_CAPTURADO	f	\N	\N
b4c9bfb0-71aa-4508-896f-457e1017efc6	Realizado contato e reunião. Relatório pronto. Aguardando retorno para futura apresentação	Yellot	Gilberto			0.00	\N	\N	\N	2026-09-01 23:01:16.387453	2026-09-01 23:01:16.387453	LEAD_CAPTURADO	f	\N	\N
cd0b1391-3b35-4c6b-bd19-58a9f4c4520a	Contato por telefone. Indicaram mandar e-mail para compras@5genergia.com.br	5G		(62) 3242-2600		0.00	\N	\N	\N	2026-09-01 23:01:16.391559	2026-09-01 23:01:16.391559	LEAD_CAPTURADO	f	\N	\N
31c94ea4-4efb-4f0b-8f92-88322d0c30e3	Usina mapeada em Aloândia 3,28MWp. Feito tentativa de contato pelo link do site	IVI Energia				0.00	\N	\N	\N	2026-09-01 23:01:16.394935	2026-09-01 23:01:16.394935	LEAD_CAPTURADO	f	\N	\N
1394e72a-3020-484f-a8d6-10bcc0023f83	Contato realizado e apresentado a solução. Deve prosseguir com diálogo.	Ativa Energia	Pablo	(46) 99263940		0.00	\N	\N	\N	2026-09-01 23:01:16.398017	2026-09-01 23:01:16.398017	LEAD_CAPTURADO	f	\N	\N
b1ac6dbf-c6ed-4244-b745-374ffaa6fa1e	Contato realizado.	Comerc	Emerson Viana	31 989812552		0.00	\N	\N	\N	2026-09-01 23:01:16.401026	2026-09-01 23:01:16.401026	LEAD_CAPTURADO	f	\N	\N
7bfb898d-d61b-4c39-8b7e-12d09da8e200	Pendente de agendamento de reunião	Mercury	Mario Morais	38 99841-9350		0.00	\N	\N	\N	2026-09-01 23:01:16.404002	2026-09-01 23:01:16.404002	LEAD_CAPTURADO	f	\N	\N
c2df5545-dd35-45bf-8c75-bccab2f0e69b	Pendente de retorno sobre o interesse da área técnica	Vale	Vanderleia	31 98223-4960		0.00	\N	\N	\N	2026-09-01 23:01:16.407165	2026-09-01 23:01:16.407165	LEAD_CAPTURADO	f	\N	\N
2f45210f-5aae-4b00-9269-7685e132ad73	Aguradando o repasse da informação para o depto tecnico - Resp Eng Bruno	Loop	Eduardo	62 3911-5968		0.00	\N	\N	\N	2026-09-01 23:01:16.410221	2026-09-01 23:01:16.410221	LEAD_CAPTURADO	f	\N	\N
5b5298c9-d313-4408-bf31-c8a03e411120	Aguardando um agendamento de apresentação para o CREA BA	FG5	Fabrício	71 99996-0065		0.00	\N	\N	\N	2026-09-01 23:01:16.414251	2026-09-01 23:01:16.414251	LEAD_CAPTURADO	f	\N	\N
81b73ea1-97fa-43a2-8ee5-e3d6d7a257f3	Realizado contato e reunião. Relatório pronto. Aguardando retorno para futura apresentação	CEL	Weslley	62 98121-8793		0.00	\N	\N	\N	2026-09-01 23:01:16.418145	2026-09-01 23:01:16.418145	LEAD_CAPTURADO	f	\N	\N
298ac700-7a60-4e78-9158-77bdaca609af	Contato realizado	Yellot	Gilberto			0.00	\N	\N	\N	2026-09-01 23:01:16.422157	2026-09-01 23:01:16.422157	LEAD_CAPTURADO	f	\N	\N
f37937d9-5eed-4621-9239-fd8f1dcbcffb	Contato por telefone. Indicaram mandar e-mail para compras@5genergia.com.br	5G		(62) 3242-2600		0.00	\N	\N	\N	2026-09-01 23:01:16.426019	2026-09-01 23:01:16.426019	LEAD_CAPTURADO	f	\N	\N
12876740-31ce-4dae-a062-aa4ec9c95558	Usina mapeada em Aloândia 3,28MWp. Feito tentativa de contato pelo link do site	IVI Energia				0.00	\N	\N	\N	2026-09-01 23:01:16.429153	2026-09-01 23:01:16.429153	LEAD_CAPTURADO	f	\N	\N
0f5c8e2a-e38d-4999-9a03-7e862bd164b1	Contato realizado e apresentado a solução. Deve prosseguir com diálogo.	Ativa Energia	Pablo	(46) 99263940		0.00	\N	\N	\N	2026-09-01 23:01:16.432492	2026-09-01 23:01:16.432492	LEAD_CAPTURADO	f	\N	\N
bc3c0cb4-0944-46ba-9f52-51e3556318d1	Contato direto na fábrica. Possui usina própria e se interessou pela solução. Preço dado 3,00/mod	Ecoplast	Eliseu	(64)9213 2037		0.00	\N	\N	\N	2026-09-01 23:01:16.43561	2026-09-01 23:01:16.43561	LEAD_CAPTURADO	f	\N	\N
cd8ba0a6-af8b-439f-af5e-ceb44d610deb	Usina em Morrinhos e várias no Brasil	Elis Energia	Hélio	65 92471334		0.00	\N	\N	\N	2026-09-01 23:01:16.438665	2026-09-01 23:01:16.438665	LEAD_CAPTURADO	f	\N	\N
ee4ace0c-e7a7-4b2e-ba2c-91ff3396354a	Usina fotovoltaica nova. Não tem no maps BR251 km 32 São Sebastião https://maps.app.goo.gl/yYjdRUjZp5P32iiv7	Smart Planet	Tayane	61 98205 2071 61 98136 0665		0.00	\N	\N	\N	2026-09-01 23:01:16.454019	2026-09-01 23:01:16.454019	LEAD_CAPTURADO	f	\N	\N
49543741-6dae-4e55-bf73-e612132fb93e	UFV Araçu IX	Sigma				3338.16	\N	\N	\N	2026-09-01 22:52:34.413802	2026-09-02 23:37:21.742673	FECHADO_GANHO	f	\N	\N
cade06b8-9883-407f-ad00-7bcc33bf1dfa	UFV Araçu I	BC - Sigma				7858.76	\N	\N	\N	2026-09-01 22:52:34.405629	2026-09-02 23:32:37.885837	FECHADO_GANHO	f	\N	\N
73b2740b-b3b7-4c0b-a72f-80b644ed567f	UFV Camarão Palmeiras (I-V)	BC Energia				29955.88	\N	\N	\N	2026-09-01 22:52:34.409872	2026-09-02 23:35:10.988373	FECHADO_GANHO	f	\N	\N
d877c7a7-7d90-4808-92cf-27968f1466d8	UFV Araçu IV	Sigma				5295.24	\N	\N	\N	2026-09-01 22:52:34.433049	2026-09-02 23:57:05.997956	FECHADO_GANHO	f	\N	\N
315c70a8-e909-4c75-a2b6-36a5fb606ee0	UFV Turvânia	Sigma				17029.49	\N	\N	\N	2026-09-01 22:52:34.41831	2026-09-02 23:54:52.9214	FECHADO_GANHO	f	\N	\N
935a4b0a-3141-4a29-b6f7-6e1c1492d987	UFV LIMIRIM I	CEL Energia				0.00	\N	\N	\N	2026-09-01 22:52:34.423283	2026-09-03 09:56:19.915538	QUALIFICACAO	f	\N	\N
5cf62311-cc6b-4c7b-9a90-f60b5b85bdeb	UFV Araçu III	Sigma				3710.35	\N	\N	\N	2026-09-01 22:52:34.428201	2026-09-02 23:56:38.780022	FECHADO_GANHO	f	\N	\N
a047661f-ca25-4e0f-b7e8-7ca873875111	UFV Bom Sucesso Palmeiras	Sigma				8427.10	\N	\N	\N	2026-09-01 22:52:34.440353	2026-09-15 18:50:09.122554	FECHADO_GANHO	f	\N	\N
703b8c65-a58c-422a-9b8a-2a0a8730ae1b	Usina fotovoltaica BR060 ao lado do posto apos Abadiânia	SolarGreen	Vinícius	62 999713191		0.00	\N	\N	\N	2026-09-01 23:01:16.451169	2026-09-03 09:56:35.650386	NEGOCIACAO	f	\N	\N
3ce424fa-b1e2-4719-ac94-86d75b87d50e	Fazenda Modelo	Sigma				576.40	\N	\N	\N	2026-09-01 22:52:34.456407	2026-09-03 09:56:43.527846	NEGOCIACAO	f	\N	\N
5e91bd7f-4b58-4bd0-9e49-b0d94d6c7aef	UFV Panamá	Sigma				7046.75	\N	\N	\N	2026-09-01 22:52:34.443648	2026-09-03 09:56:48.668724	NEGOCIACAO	f	\N	\N
8b20b7ce-7085-4a98-9f7a-7adb1da01b94	UFV Paranoá	Sigma				25423.63	\N	\N	\N	2026-09-01 22:52:34.44678	2026-09-03 09:56:54.103198	NEGOCIACAO	f	\N	\N
c2134081-65df-40d8-a80c-64dfd8052297	UFV Rio Monte I	Sigma				14073.33	\N	\N	\N	2026-09-01 22:52:34.449987	2026-09-03 09:56:59.147184	NEGOCIACAO	f	\N	\N
fd194f77-7e06-435d-bf59-0ea525155a5a	UFV Rio Bonito	Sigma				13785.00	\N	\N	\N	2026-09-01 22:52:34.452934	2026-09-03 09:57:04.073508	NEGOCIACAO	f	\N	\N
85b3a4c0-ad8b-40d3-89e5-4b94656fee3b	Araçu I - Grampos	Sigma				1686.35	\N	\N	\N	2026-09-01 22:52:34.45946	2026-09-03 09:57:09.127087	NEGOCIACAO	f	\N	\N
dd69eb3b-57fb-45f1-94af-a2a6ed20b431	UFV Morrinhos	Helio				3846.48	\N	\N	\N	2026-09-01 22:52:34.46237	2026-09-03 09:57:13.854901	NEGOCIACAO	f	\N	\N
a1ecff0b-f690-4e01-a41e-ec78c37092c4	UFV Abadiânia	SolarGreen				6977.60	\N	\N	\N	2026-09-01 22:52:34.465966	2026-09-03 09:57:18.195724	NEGOCIACAO	f	\N	\N
586ff674-4180-41ae-83e9-c9a2cb926f69	UFV City	Sigma				3482.90	\N	\N	\N	2026-09-01 22:52:34.468759	2026-09-03 09:57:22.907222	NEGOCIACAO	f	\N	\N
f9873961-9e54-41fd-a8e6-1b64879cd09a	Rancho Jatobá	Ecoplast				450.00	\N	\N	\N	2026-09-01 22:52:34.471895	2026-09-03 09:57:27.150293	NEGOCIACAO	f	\N	\N
7740aeb1-6ac7-45d9-b919-d99b9c2443d6	Irecê 0	Gali Energia				34291.35	\N	\N	\N	2026-09-01 22:52:34.480545	2026-09-03 09:57:32.006809	NEGOCIACAO	f	\N	\N
3f5e752b-775a-40fe-b0a1-cb662e837c7e	Araguatins	Sigma				17577.14	\N	\N	\N	2026-09-01 22:52:34.477748	2026-09-03 09:57:36.011253	NEGOCIACAO	f	\N	\N
edc4b35a-6f21-4c33-99f9-d96283a3ede9	Treinamento	Gali Energia				1250.00	\N	\N	\N	2026-09-01 22:52:34.474734	2026-09-03 09:57:40.370608	NEGOCIACAO	f	\N	\N
37cd57f1-15aa-4e2a-92b8-fc0ef7aa634c	Irecê 3	Gali Energia				0.00	\N	\N	\N	2026-09-01 22:52:34.483308	2026-09-03 09:57:51.023406	QUALIFICACAO	f	\N	\N
afd4d20d-99b2-42f5-b44b-78eff6499211	UFV Ibiúna	Sigma				0.00	\N	\N	\N	2026-09-01 22:52:34.486352	2026-09-03 09:57:56.390991	NEGOCIACAO	f	\N	\N
44eec6e2-de03-4489-a616-8a195dce46d5	Contato realizado.	Comerc	Emerson Viana	31 989812552		0.00	\N	\N	\N	2026-09-01 23:01:16.353494	2026-09-03 09:58:01.166247	QUALIFICACAO	f	\N	\N
d75e2728-d4fd-4248-8bfd-4f7047eb6818	Possui usinas em Terezopolis e Barro Alto. Parceiro da Celgpar	Voltaxx	Guilherme	62 982000137		0.00	\N	\N	\N	2026-09-01 23:01:16.448291	2026-09-03 09:58:10.044681	NEGOCIACAO	f	\N	\N
7fe7afe2-d8f8-48f8-aedf-03fd70e0c3c8	Usina em Morrinhos e várias. Contato telefônico e interesse pela solução. Entrar em contato novamente para detalhar.	HR energia	Umberto	85 9666 7722		0.00	\N	\N	\N	2026-09-01 23:01:16.442821	2026-09-03 09:58:24.40148	PROPOSTA_ENVIADA	f	\N	\N
c9868892-4b8b-4ed0-8f6e-bf0b19ff0f27	UFV Machadinho Uruaçu	Sigma				6359.81	\N	\N	\N	2026-09-01 22:52:34.436845	2026-09-10 14:36:00.827924	FECHADO_GANHO	f	\N	\N
b37287e2-bc2e-45bd-bcce-2e05debf3db8	Usinas Brasilia 100 e Brasilia 200	Aevo Solar	Francisco	61 99555 3368		0.00	\N	\N	\N	2026-09-01 23:01:16.45965	2026-09-03 09:58:14.348388	PROPOSTA_ENVIADA	f	\N	\N
68fd468f-42fe-4ec1-a203-6602f161b0ce	Granja em Morrinhos que possui grande usina	Granja Quality	Marquim	64 99185051		0.00	\N	\N	\N	2026-09-01 23:01:16.462492	2026-09-03 09:58:18.055532	PROPOSTA_ENVIADA	f	\N	\N
fb2056f9-6781-4ca0-a898-dc6c86d855e6	Implantou várias usinas no Brasil	Hsolar	Pedro	61 99895588		0.00	\N	\N	\N	2026-09-01 23:01:16.4652	2026-09-03 09:58:20.319803	PROPOSTA_ENVIADA	f	\N	\N
03ce6681-1b46-4fa8-bbda-c7b5aa3cc954	Usina Capital  Solar?	Raízen	Rubens	31 98854 6278		0.00	\N	\N	\N	2026-09-01 23:01:16.456901	2026-09-03 09:58:22.286616	PROPOSTA_ENVIADA	f	\N	\N
363aa8fb-63b2-4ee9-beeb-b40d32275916	usina mapeada em Leopoldo de Bulhões - Msg enviada via site	GDSUN				0.00	\N	\N	\N	2026-09-01 23:01:16.482815	2026-09-02 11:16:15.972107	QUALIFICACAO	f	\N	\N
e24a7a77-da93-4abd-9b4b-c3ea759c86e5	Lead Importado 35	Newwave energia		+55 11 3027-4200		0.00	\N	\N	\N	2026-09-01 23:01:16.477285	2026-09-02 11:24:03.220938	QUALIFICACAO	f	\N	\N
944dd0a5-fd22-4ef3-87a2-efd3c4e4ac3e	Lead Importado 34	Athonenergia				0.00	\N	\N	\N	2026-09-01 23:01:16.474528	2026-09-02 11:24:05.59483	QUALIFICACAO	f	\N	\N
f83e694b-50ab-4f84-8b1b-50b055b3299f	Lead Importado 33	Serena Energia				0.00	\N	\N	\N	2026-09-01 23:01:16.471608	2026-09-02 11:24:07.002153	QUALIFICACAO	f	\N	\N
f5b298ab-1984-4361-b159-5ae83079a814	Iniciar Contato	Eco Power		62 98127-6353 62 3928-1016		0.00	\N	\N	\N	2026-09-01 23:01:16.468337	2026-09-02 11:24:08.654575	QUALIFICACAO	f	\N	\N
7c365063-e3f8-4aa6-a9a3-6cfcad2107f7	Lead Importado 36	América Energia S.A				1000.00	\N	\N	\N	2026-09-01 23:01:16.480023	2026-09-02 16:32:00.315272	QUALIFICACAO	f	\N	\N
4e4324ef-5e2a-47ad-afb2-3959dd835828	UFV Lençóis Paulista I	Sigma				3517.04	\N	\N	\N	2026-09-01 22:52:34.400596	2026-09-02 18:57:09.319281	FECHADO_GANHO	f	\N	\N
cb03fdd5-e3c5-401e-b704-bc022e418585	UFV Clareira Araçu (I-II)	Sigma				4116.00	\N	\N	\N	2026-09-01 22:52:34.392598	2026-09-02 18:58:26.487507	FECHADO_GANHO	f	\N	\N
d975e116-efca-438d-850b-83d793c65e99	Usina Fotovolataica Di Roma Caldas Novas	Di Roma	José Inácio	64 99206-4016		0.00	\N	\N	\N	2026-09-01 23:01:16.445581	2026-09-03 09:57:44.821726	QUALIFICACAO	f	\N	\N
\.


--
-- Data for Name: payable_categories; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.payable_categories (id, name, description, color) FROM stdin;
\.


--
-- Data for Name: payables; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.payables (id, amount, "dueDate", category, notes, "recurringExpenseId", "createdAt", "updatedAt", "paidAt", "expenseId", "generatesReceipt", description, status, "paymentMethod") FROM stdin;
434f5b78-cf96-4b8b-8343-c9b19792143d	400.00	2026-09-20	Outros	Gerado automaticamente a partir da despesa ID: b3bf8872-3993-44b3-8abd-8b50f4d8d4a4	\N	2026-09-04 12:17:16.074186	2026-09-04 12:17:16.074186	\N	b3bf8872-3993-44b3-8abd-8b50f4d8d4a4	f	Conatbilidade	PENDENTE	\N
2ce2bf63-541c-4374-980e-f638f639c937	8400.00	2026-09-09	Outros	Gerado automaticamente a partir da despesa ID: e816bcc5-4e0c-49d4-b8b8-30aaa82959df	\N	2026-09-15 18:03:26.602174	2026-09-15 18:03:26.602174	\N	e816bcc5-4e0c-49d4-b8b8-30aaa82959df	f	Pró-Labores	PENDENTE	\N
799a4b55-17b5-4645-a456-4d7d46d297f6	1350.00	2026-09-15	Outros	Gerado automaticamente a partir da despesa ID: 8baa7c3d-32c1-4d6d-93f8-bcbbb0909ff2	\N	2026-09-15 18:03:56.948865	2026-09-15 18:03:56.948865	\N	8baa7c3d-32c1-4d6d-93f8-bcbbb0909ff2	f	IWILL Design	PENDENTE	\N
b4cfae9c-f7d5-4140-bd25-393f664e1d93	960.00	2024-06-13	\N	\N	\N	2026-09-16 21:08:51.406965	2026-09-16 21:08:51.406965	2024-06-13	\N	f	Pix enviado: "Cp :15111975-COMPANY HERO LTDA"	PAGO	\N
78d6a956-e2c3-4ab3-854e-1f58c3665f2e	223.03	2024-08-14	\N	\N	\N	2026-09-16 21:08:51.539657	2026-09-16 21:08:51.539657	2024-08-14	\N	f	Pix enviado: "Cp :60701190-GOIANIA PREFEITURA MUNICIPAL GABINETE"	PAGO	\N
5c69894b-e66e-41f4-a9ea-8b92a760bf59	202.92	2024-08-19	\N	\N	\N	2026-09-16 21:08:51.554789	2026-09-16 21:08:51.554789	2024-08-19	\N	f	Pagamento de Convenio PREFEITURA MUNICIPAL GOIANIA GO	PAGO	\N
6f565154-8c82-4fc0-97ab-9e97b47e0d15	142.00	2024-08-22	\N	\N	\N	2026-09-16 21:08:51.579038	2026-09-16 21:08:51.579038	2024-08-22	\N	f	Pagamento efetuado INSTITUTO NACIONAL DA PROPRIEDADE INDUSTRIAL . INP	PAGO	\N
f46256be-ddec-4c83-b012-7b0ff65a3b9c	246.96	2024-10-11	\N	\N	\N	2026-09-16 21:08:51.59748	2026-09-16 21:08:51.59748	2024-10-11	\N	f	Pagamento de Convenio SIMPLES NACIONAL	PAGO	\N
4d4c4825-a6fe-4272-a8b7-a836c7c62921	875.00	2025-03-21	\N	\N	\N	2026-09-16 21:08:51.613238	2026-09-16 21:08:51.613238	2025-03-21	\N	f	Pix enviado: "Cp :18236120-Nicole Liecheski"	PAGO	\N
3f6bae80-fa46-496b-a0ad-ce312b4d1115	211.72	2025-03-21	\N	\N	\N	2026-09-16 21:08:51.6276	2026-09-16 21:08:51.6276	2025-03-21	\N	f	Pix enviado: "Cp :00000000-RECEITA FEDERAL"	PAGO	\N
3d4413c3-35d9-44fd-85a1-d95026d359a2	875.00	2025-04-08	\N	\N	\N	2026-09-16 21:08:51.642736	2026-09-16 21:08:51.642736	2025-04-08	\N	f	Pix enviado: "Cp :18236120-Nicole Liecheski"	PAGO	\N
efc382f2-bd9f-4f42-aaed-bc03d06d5e34	9347.58	2025-04-22	\N	\N	\N	2026-09-16 21:08:51.658526	2026-09-16 21:08:51.658526	2025-04-22	\N	f	Pix enviado: "Cp :60701190-Grupo Sigma Engenharia"	PAGO	\N
871f60d0-78e4-492b-a8a2-6d67c985e5ae	1150.00	2025-04-22	\N	\N	\N	2026-09-16 21:08:51.673139	2026-09-16 21:08:51.673139	2025-04-22	\N	f	Pix enviado: "Cp :60701190-Grazielly Vieira Lima"	PAGO	\N
73551460-fce4-483f-a0ac-4138b1d95e72	31619.91	2025-05-02	\N	\N	\N	2026-09-16 21:08:51.684879	2026-09-16 21:08:51.684879	2025-05-02	\N	f	Pix enviado: "Cp :00000000-Nw Drones Comercio E Manutencao de Drones LTDA"	PAGO	\N
3aa0ab74-7f4c-44b5-b458-5c928632195a	875.00	2025-05-07	\N	\N	\N	2026-09-16 21:08:51.69567	2026-09-16 21:08:51.69567	2025-05-07	\N	f	Pix enviado: "Cp :00000000-Nicole Liecheski"	PAGO	\N
a51ebcac-c7b4-4e87-96e4-01002fc08b6f	1150.00	2025-05-21	\N	\N	\N	2026-09-16 21:08:51.707955	2026-09-16 21:08:51.707955	2025-05-21	\N	f	Pix enviado: "Cp :60701190-Grazielly Vieira Lima"	PAGO	\N
812923bf-34af-4a36-b332-b9aa9308a9c4	3853.13	2025-05-21	\N	\N	\N	2026-09-16 21:08:51.719182	2026-09-16 21:08:51.719182	2025-05-21	\N	f	Pix enviado: "Cp :00000000-RECEITA FEDERAL"	PAGO	\N
32565e94-6332-4f6d-81dd-1792d29be6ec	6919.89	2025-06-02	\N	\N	\N	2026-09-16 21:08:51.735329	2026-09-16 21:08:51.735329	2025-06-02	\N	f	Pix enviado: "Cp :13884775-Magazine Luiza Marketplace"	PAGO	\N
c742a23d-f6ef-4509-9808-9824ce881202	960.00	2025-06-06	\N	\N	\N	2026-09-16 21:08:51.76929	2026-09-16 21:08:51.76929	2025-06-06	\N	f	Pix enviado: "Cp :15111975-COMPANY HERO LTDA"	PAGO	\N
6f8b10eb-430b-4997-9088-1f2518b931ed	875.00	2025-06-10	\N	\N	\N	2026-09-16 21:08:51.783528	2026-09-16 21:08:51.783528	2025-06-10	\N	f	Pix enviado: "Cp :18236120-Nicole Liecheski"	PAGO	\N
23fd4139-8be6-4322-a90b-0bd374b97830	1150.00	2025-06-24	\N	\N	\N	2026-09-16 21:08:51.796327	2026-09-16 21:08:51.796327	2025-06-24	\N	f	Pix enviado: "Cp :60701190-Grazielly Vieira Lima"	PAGO	\N
050f4dee-f478-464d-b2fd-d22935c7c8d1	35.00	2025-07-08	\N	\N	\N	2026-09-16 21:08:51.808208	2026-09-16 21:08:51.808208	2025-07-08	\N	f	Pagamento efetuado: "Pagamento fatura cartao Inter"	PAGO	\N
6e43aca2-b27f-4dbc-98d0-93fd13defa0c	1791.17	2025-07-14	\N	\N	\N	2026-09-16 21:08:51.818098	2026-09-16 21:08:51.818098	2025-07-14	\N	f	Pix enviado: "Cp :10573521-Cleiber Nichida"	PAGO	\N
67927040-d23f-42a7-ac29-078bccd7b3e3	875.00	2025-07-14	\N	\N	\N	2026-09-16 21:08:51.828306	2026-09-16 21:08:51.828306	2025-07-14	\N	f	Pix enviado: "Cp :18236120-Nicole Liecheski"	PAGO	\N
d11e0aaa-925e-4573-930b-71f461dbb1f9	238.56	2025-07-17	\N	\N	\N	2026-09-16 21:08:51.839607	2026-09-16 21:08:51.839607	2025-07-17	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N
29bcb301-cb1f-486b-bdb1-1caeb6652f31	120.84	2025-07-17	\N	\N	\N	2026-09-16 21:08:51.851025	2026-09-16 21:08:51.851025	2025-07-17	\N	f	Pix enviado: "Cp :10573521-Cleiber Nichida"	PAGO	\N
e4c14994-f194-4075-9562-7d4de9127c56	103.03	2025-07-22	\N	\N	\N	2026-09-16 21:08:51.862036	2026-09-16 21:08:51.862036	2025-07-22	\N	f	Pix enviado: "Cp :00000000-CONSELHO REGIONAL DE ENGENHARIA E AGRONOMIA DE GOIAS"	PAGO	\N
5a3813aa-d71d-4a3e-a3b3-5616027df034	271.47	2025-07-22	\N	\N	\N	2026-09-16 21:08:51.887329	2026-09-16 21:08:51.887329	2025-07-22	\N	f	Pix enviado: "Cp :00000000-CONSELHO REGIONAL DE ENGENHARIA E AGRONOMIA DE GOIAS"	PAGO	\N
8055c4f8-6e6a-4e00-9c6f-d992b4465865	4814.05	2025-07-24	\N	\N	\N	2026-09-16 21:08:51.918498	2026-09-16 21:08:51.918498	2025-07-24	\N	f	Pix enviado: "Cp :00000000-RECEITA FEDERAL"	PAGO	\N
5cd66009-20fd-472a-a8d0-5564aeba1be1	6660.00	2025-07-25	\N	\N	\N	2026-09-16 21:08:51.928789	2026-09-16 21:08:51.928789	2025-07-25	\N	f	Pix enviado: "Cp :00000000-NW DRONES COMERCIO E MANUTENCAO DE DRONES LTDA"	PAGO	\N
76157979-e723-42fa-8f59-65d4bcd32b31	129.70	2025-07-31	\N	\N	\N	2026-09-16 21:08:51.939903	2026-09-16 21:08:51.939903	2025-07-31	\N	f	Pix enviado: "Cp :60701190-GOIANIA PREFEITURA MUNICIPAL GABINETE DO PREFEITO"	PAGO	\N
2f4d03c7-e4b5-4798-bfe3-f2ce3043d5ea	199.99	2025-08-06	\N	\N	\N	2026-09-16 21:08:51.944982	2026-09-16 21:08:51.944982	2025-08-06	\N	f	Pix enviado: "Cp :60701190-TOBELLI COMERCIO DE CALCADOS LTDA"	PAGO	\N
e0884401-7e2d-4cbb-82c3-5a3c976e274a	73.10	2025-08-11	\N	\N	\N	2026-09-16 21:08:51.951358	2026-09-16 21:08:51.951358	2025-08-11	\N	f	Pagamento efetuado: "Pagamento fatura cartao Inter"	PAGO	\N
f56af91a-e7ce-45d5-990b-6978292d776e	129.70	2025-08-25	\N	\N	\N	2026-09-16 21:08:51.95793	2026-09-16 21:08:51.95793	2025-08-25	\N	f	Pix enviado: "Cp :60701190-GOIANIA PREFEITURA MUNICIPAL GABINETE DO PREFEITO"	PAGO	\N
bf56223f-c6ee-4acb-91f2-d67b8167e7f8	129.70	2025-08-26	\N	\N	\N	2026-09-16 21:08:51.962902	2026-09-16 21:08:51.962902	2025-08-26	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N
bd0f8bb8-73b5-4b9f-98d6-bcb34941e0cf	1150.00	2025-08-27	\N	\N	\N	2026-09-16 21:08:51.970207	2026-09-16 21:08:51.970207	2025-08-27	\N	f	Pix enviado: "Cp :60701190-Grazielly Vieira Lima"	PAGO	\N
b9b56c62-a5ae-4acd-ba32-23c8516a6f79	338.00	2025-09-04	\N	\N	\N	2026-09-16 21:08:51.976561	2026-09-16 21:08:51.976561	2025-09-04	\N	f	Pagamento de Convenio: "DARE - DEMAIS ORGAOS GO"	PAGO	\N
d2643cfb-7fc3-404f-a051-07a95a34d291	294.85	2025-09-04	\N	\N	\N	2026-09-16 21:08:51.981609	2026-09-16 21:08:51.981609	2025-09-04	\N	f	Pagamento efetuado: "CONSELHO NACIONAL DE DESENVOLVIMENTO CIENTIFICO E"	PAGO	\N
29f85b18-0b1c-4a5a-bbbf-0c3316da4bed	463.98	2025-09-11	\N	\N	\N	2026-09-16 21:08:51.988929	2026-09-16 21:08:51.988929	2025-09-11	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N
5544368a-c667-4318-a8e0-259cd16a01c9	1476.72	2025-09-11	\N	\N	\N	2026-09-16 21:08:51.994271	2026-09-16 21:08:51.994271	2025-09-11	\N	f	Pix enviado: "Cp :10573521-Cleiber Nichida"	PAGO	\N
987a4d77-d19c-4274-83cc-76b90a333317	73.10	2025-09-12	\N	\N	\N	2026-09-16 21:08:52.000168	2026-09-16 21:08:52.000168	2025-09-12	\N	f	Pagamento efetuado: "Pagamento fatura cartao Inter"	PAGO	\N
b2534692-a222-4275-aa32-ad64a717278b	5294.46	2025-09-12	\N	\N	\N	2026-09-16 21:08:52.006625	2026-09-16 21:08:52.006625	2025-09-12	\N	f	Pix enviado: "Cp :90400888-IATA INTERNATIONAL AIR TRANSPORT ASSOCIATION"	PAGO	\N
6096cda8-4f5f-4a49-adad-ba58341d1598	400.00	2025-09-24	\N	\N	\N	2026-09-16 21:08:52.011424	2026-09-16 21:08:52.011424	2025-09-24	\N	f	Pix enviado: "Cp :06332931-Kleber Ramos de Morais"	PAGO	\N
f893cfef-8f4a-4552-b5ca-3c1c7df4f44b	100.00	2025-09-24	\N	\N	\N	2026-09-16 21:08:52.017566	2026-09-16 21:08:52.017566	2025-09-24	\N	f	Pagamento efetuado: "Pagamento fatura cartao Inter"	PAGO	\N
f52b6e77-c1c2-40e5-ad3d-306b9ded00e4	1150.00	2025-09-24	\N	\N	\N	2026-09-16 21:08:52.023969	2026-09-16 21:08:52.023969	2025-09-24	\N	f	Pix enviado: "Cp :60701190-Grazielly Vieira Lima"	PAGO	\N
69bedee7-5447-41be-8fcf-677bc1e2787e	1849.03	2025-09-24	\N	\N	\N	2026-09-16 21:08:52.028523	2026-09-16 21:08:52.028523	2025-09-24	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N
c4243d62-65e5-4ba5-aa71-5ea69a069ebe	2500.00	2025-09-26	\N	\N	\N	2026-09-16 21:08:52.034536	2026-09-16 21:08:52.034536	2025-09-26	\N	f	Pix enviado: "Cp :10573521-Cleiber Nichida"	PAGO	\N
65e6a4f1-88af-40d1-866f-a2731085aad6	3500.00	2025-09-26	\N	\N	\N	2026-09-16 21:08:52.041125	2026-09-16 21:08:52.041125	2025-09-26	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N
e16a95f5-f154-48ea-8b03-7e219b8308d5	40.85	2025-10-01	\N	\N	\N	2026-09-16 21:08:52.04571	2026-09-16 21:08:52.04571	2025-10-01	\N	f	Compra no debito: "No estabelecimento DL *GOOGLE CLOUD Rvw3P Sao Pablo BRA"	PAGO	\N
d08e677d-d04a-4bd1-8916-41c30795cc36	972.60	2025-10-09	\N	\N	\N	2026-09-16 21:08:52.052763	2026-09-16 21:08:52.052763	2025-10-09	\N	f	Pagamento efetuado: "Pagamento fatura cartao Inter"	PAGO	\N
ec0f4576-ae44-4d57-bf18-b84883148190	875.00	2025-10-09	\N	\N	\N	2026-09-16 21:08:52.058728	2026-09-16 21:08:52.058728	2025-10-09	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N
d92a639d-b3e2-4354-8927-81c917074acd	78.96	2025-10-14	\N	\N	\N	2026-09-16 21:08:52.063689	2026-09-16 21:08:52.063689	2025-10-14	\N	f	Pix enviado: "Cp :10573521-Cleiber Nichida"	PAGO	\N
7b9a2927-1bb9-4c51-bc81-c842570469fe	3500.00	2025-10-15	\N	\N	\N	2026-09-16 21:08:52.222381	2026-09-16 21:08:52.222381	2025-10-15	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N
f98ff2cf-41a8-4d18-93b1-74e055c642f0	2500.00	2025-10-15	\N	\N	\N	2026-09-16 21:08:52.227916	2026-09-16 21:08:52.227916	2025-10-15	\N	f	Pix enviado: "Cp :10573521-Cleiber Nichida"	PAGO	\N
724b77f6-9ffa-4158-81bd-8efcb07f656c	112.46	2025-10-20	\N	\N	\N	2026-09-16 21:08:52.232844	2026-09-16 21:08:52.232844	2025-10-20	\N	f	Pix enviado: "Cp :60701190-RECEITA FEDERAL"	PAGO	\N
dcf317d1-6434-477a-96a9-7433b34c164a	13.73	2025-10-20	\N	\N	\N	2026-09-16 21:08:52.239014	2026-09-16 21:08:52.239014	2025-10-20	\N	f	Pix enviado: "Cp :00000000-RECEITA FEDERAL"	PAGO	\N
cccbd05d-f751-4d9f-bb3d-76fb842db4d5	254.72	2025-10-23	\N	\N	\N	2026-09-16 21:08:52.244127	2026-09-16 21:08:52.244127	2025-10-23	\N	f	Pix enviado: "Cp :18236120-Dectra Tecnologia LTDA"	PAGO	\N
792f3f1e-ec8a-43fa-b82d-c8c1483536da	400.00	2025-10-23	\N	\N	\N	2026-09-16 21:08:52.248676	2026-09-16 21:08:52.248676	2025-10-23	\N	f	Pix enviado: "Cp :06332931-Kleber Ramos de Morais"	PAGO	\N
29dec016-763d-4bab-ad05-522dfa2edf91	1150.00	2025-10-23	\N	\N	\N	2026-09-16 21:08:52.25578	2026-09-16 21:08:52.25578	2025-10-23	\N	f	Pix enviado: "Cp :60701190-Grazielly Vieira Lima"	PAGO	\N
78ae1638-6a1a-4440-b5bc-f54af80bbab7	1684.68	2025-10-26	\N	\N	\N	2026-09-16 21:08:52.260699	2026-09-16 21:08:52.260699	2025-10-26	\N	f	Pix enviado: "Cp :60701190-DECOLAR COM LTDA"	PAGO	\N
ce9ce6b1-9336-45d3-8595-42a2ebb77a2a	713.15	2025-11-03	\N	\N	\N	2026-09-16 21:08:52.265345	2026-09-16 21:08:52.265345	2025-11-03	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N
a360ec51-bbd2-4007-a6f1-bc28718e3836	1212.97	2025-11-10	\N	\N	\N	2026-09-16 21:08:52.273115	2026-09-16 21:08:52.273115	2025-11-10	\N	f	Pagamento efetuado: "Pagamento fatura cartao Inter"	PAGO	\N
eed4ae5c-5003-43a6-81a1-fcafcdde2e3d	3500.00	2025-11-11	\N	\N	\N	2026-09-16 21:08:52.278011	2026-09-16 21:08:52.278011	2025-11-11	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N
a177ca18-6c27-443d-8a05-c95861a75528	288.00	2025-11-11	\N	\N	\N	2026-09-16 21:08:52.28344	2026-09-16 21:08:52.28344	2025-11-11	\N	f	Pix enviado: "Cp :10573521-Cleiber Nichida"	PAGO	\N
e5c7b7a8-0880-4d53-90a7-cfc24cec8506	2500.00	2025-11-11	\N	\N	\N	2026-09-16 21:08:52.289251	2026-09-16 21:08:52.289251	2025-11-11	\N	f	Pix enviado: "Cp :10573521-Cleiber Nichida"	PAGO	\N
688d655a-1494-4fdb-b120-10f41c8e2325	400.00	2025-11-21	\N	\N	\N	2026-09-16 21:08:52.294011	2026-09-16 21:08:52.294011	2025-11-21	\N	f	Pix enviado: "Cp :06332931-Kleber Ramos de Morais"	PAGO	\N
62a00049-42a4-4d23-bca6-19fe3daf97e4	2057.49	2025-11-21	\N	\N	\N	2026-09-16 21:08:52.299791	2026-09-16 21:08:52.299791	2025-11-21	\N	f	Pix enviado: "Cp :00000000-RECEITA FEDERAL"	PAGO	\N
8a2287ec-d590-483b-b8fb-acf9272f2129	1150.00	2025-12-03	\N	\N	\N	2026-09-16 21:08:52.306707	2026-09-16 21:08:52.306707	2025-12-03	\N	f	Pix enviado: "Cp :60701190-Grazielly Vieira Lima"	PAGO	\N
ab95c16f-782f-4992-9fbf-cb0d66e77c0c	2500.00	2025-12-09	\N	\N	\N	2026-09-16 21:08:52.311514	2026-09-16 21:08:52.311514	2025-12-09	\N	f	Pix enviado: "Cp :10573521-Cleiber Nichida"	PAGO	\N
a44ce7dd-1c8c-4140-b062-2d74f79f476a	3500.00	2025-12-09	\N	\N	\N	2026-09-16 21:08:52.317086	2026-09-16 21:08:52.317086	2025-12-09	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N
20a37b10-e568-4ef0-add8-2507b314d332	977.68	2025-12-09	\N	\N	\N	2026-09-16 21:08:52.323233	2026-09-16 21:08:52.323233	2025-12-09	\N	f	Pagamento efetuado: "Pagamento fatura cartao Inter"	PAGO	\N
3812472e-548f-4be6-951a-43e02e210fcd	400.00	2025-12-23	\N	\N	\N	2026-09-16 21:08:52.327839	2026-09-16 21:08:52.327839	2025-12-23	\N	f	Pix enviado: "Cp :60701190-Kleber Ramos de Morais"	PAGO	\N
a200bb1d-f140-4932-b8b6-ad5b1c51769d	3500.00	2026-01-02	\N	\N	\N	2026-09-16 21:08:52.332027	2026-09-16 21:08:52.332027	2026-01-02	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N
de1047bb-7879-4d5d-a1c0-f2826f14dcb6	28.19	2026-01-05	\N	\N	\N	2026-09-16 21:08:52.339213	2026-09-16 21:08:52.339213	2026-01-05	\N	f	Pix enviado: "Cp :18236120-Dectra Tecnologia LTDA"	PAGO	\N
7380e09f-020f-4429-9c1f-7d83cabc877e	877.20	2026-01-05	\N	\N	\N	2026-09-16 21:08:52.344577	2026-09-16 21:08:52.344577	2026-01-05	\N	f	Pagamento efetuado: "Pagamento fatura cartao Inter"	PAGO	\N
cffe2b6a-e2f4-4acd-ba64-f3ce3a58384a	2500.00	2026-01-09	\N	\N	\N	2026-09-16 21:08:52.3487	2026-09-16 21:08:52.3487	2026-01-09	\N	f	Pix enviado: "Cp :10573521-Cleiber Nichida"	PAGO	\N
5deba6a2-9243-492c-9f6a-2b818a5e8b2c	2300.00	2026-01-13	\N	\N	\N	2026-09-16 21:08:52.355657	2026-09-16 21:08:52.355657	2026-01-13	\N	f	Pix enviado: "Cp :60701190-Grazielly Vieira Lima"	PAGO	\N
3bdc5a39-f173-40a1-b720-5ab0eb2cbb06	11430.45	2026-01-13	\N	\N	\N	2026-09-16 21:08:52.36045	2026-09-16 21:08:52.36045	2026-01-13	\N	f	Aplicacao: "CDB DI LIQ BANCO INTER S A"	PAGO	\N
bfa10a7e-856f-428c-8aa7-e6bbdefd1b39	130.16	2026-01-14	\N	\N	\N	2026-09-16 21:08:52.364755	2026-09-16 21:08:52.364755	2026-01-14	\N	f	Pagamento efetuado: "DEPARTAMENTO ESTADUAL DE TRANSITO"	PAGO	\N
\.


--
-- Data for Name: receipts; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.receipts (id, type, "receiptNumber", description, amount, "receiptDate", "issuerName", "issuerDocument", "issuerAddress", "linkedEntityType", "linkedEntityId", status, attachments, notes, "paymentMethod", "createdAt", "updatedAt", city) FROM stdin;
eb21b8e1-6028-4a54-bc69-e4151e4a4c94	PRO_LABORE	REC-2026-0004	Serviços administrativos, desenvolvimento de software, acompanhamento de processamento de imagens. 40h semanais	4700.00	2026-09-09	Carlos Rocha	\N	\N	\N	\N	PAGO	\N	\N	PIX	2026-09-09 19:09:21.816205	2026-09-15 17:58:57.830779	Goiânia/GO
89da9e2d-3e3c-4024-a25e-6c7a307be707	PRO_LABORE	REC-2026-0001	Serviços administrativos, marketing, acompanhamento e prospecção de negócios. Análise de relatórios gerados. 40 horas semanais.	3700.00	2026-09-09	Cleiber Nichida	781.095.071-15	\N	\N	\N	PAGO	\N	\N	PIX	2026-09-08 18:44:02.872177	2026-09-15 17:59:06.495988	Goiânia/GO
\.


--
-- Data for Name: receivables; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.receivables (id, "contractId", description, amount, "paidAmount", "dueDate", "paidAt", status, "createdAt", "updatedAt") FROM stdin;
87f6f883-b2be-4e57-9fd5-ae34ecdc5fbd	24100dbc-59d8-4311-98d4-8e2d50dd48a1	Parcela 1/1 - UFV Clareira Araçu (I-II) - 01/09/2024	4116.00	0.00	2024-09-10	2026-09-02	RECEBIDO	2026-09-02 18:58:26.474518	2026-09-02 23:55:14.737734
96b8a5f3-c630-4351-9c13-da100bcefa28	1880bb8f-3b49-4dd0-9be7-b2aa15fbcd02	Parcela 1/1 - UFV Araçu I - 20/02/2025	7858.76	0.00	2025-02-10	2026-09-02	RECEBIDO	2026-09-02 23:32:37.875467	2026-09-02 23:32:37.875467
578844f2-4491-4f2b-9d7a-653e78708d64	e6487940-e1ee-478e-b9cb-32655d0c40c4	Parcela 1/1 - UFV Camarão Palmeiras (I-V) - 20/02/2025	29955.88	0.00	2025-02-10	2026-09-02	RECEBIDO	2026-09-02 23:35:10.978441	2026-09-02 23:35:10.978441
9f4d8bf0-44b8-4529-8be6-1cb11448a081	e2152271-07d4-4def-bd99-99949beecd4d	Parcela 1/1 - UFV Araçu IX - 18/03/2025	3338.16	0.00	2025-03-10	2026-09-02	RECEBIDO	2026-09-02 23:37:21.731816	2026-09-02 23:37:21.731816
44dd60c2-def6-47bf-82f8-c4af077709da	359b141c-3ef2-4359-b613-7839c480bdb2	Parcela 1/1 - UFV Turvânia - 18/03/2025	17029.49	0.00	2025-03-10	2026-09-02	RECEBIDO	2026-09-02 23:54:52.911391	2026-09-02 23:54:52.911391
5818bc77-4db3-451b-8fa0-4f0c470ecea2	c6554c41-9341-4cd0-8620-782329e8b0f6	Parcela 1/1 - UFV Lençóis Paulista I - 01/09/2025	3517.04	0.00	2025-09-10	2026-09-02	RECEBIDO	2026-09-02 18:57:09.305749	2026-09-02 18:57:09.305749
a77df886-996b-4894-b561-4b8f9e324d62	85d8d39a-f835-4e8f-9492-41c6310c5fa5	Parcela 1/1 - UFV Araçu III - 28/04/2025	3710.35	0.00	2025-04-10	2026-09-02	RECEBIDO	2026-09-02 23:56:38.769856	2026-09-02 23:56:38.769856
bbe80e10-0117-44d4-9854-d341024ed0ed	cbfd13c7-eee5-4cb9-a067-b54c39774099	Parcela 1/1 - UFV Araçu IV - 28/04/2025	5295.24	0.00	2025-04-10	2026-09-02	RECEBIDO	2026-09-02 23:57:05.989575	2026-09-02 23:57:05.989575
a85cfdf7-c901-465a-ba2a-c80e7b7e0a1c	9718e8ba-3ab9-4209-87d1-ce34c169be91	Parcela 1/1 - UFV Machadinho Uruaçu - 09/09/2026	6359.81	0.00	2026-09-10	\N	PENDENTE	2026-09-10 14:36:00.81169	2026-09-10 14:36:00.81169
a1ce3554-2f51-45f3-8bfe-00c8fa4355d8	1332383d-073f-4474-b96a-09ea27a5a7ac	Parcela 1/1 - UFV Bom Sucesso Palmeiras - 28/04/2025	8427.10	0.00	2025-04-29	\N	PENDENTE	2026-09-15 18:50:09.110792	2026-09-15 18:50:09.110792
\.


--
-- Data for Name: recurring_expenses; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.recurring_expenses (id, description, category, "estimatedAmount", "dueDay", status, notes, "lastGenerated", "createdAt", "updatedAt", "generatesReceipt", "autoConfirmOnDueDate") FROM stdin;
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
7b4ee9ba-c1f4-4326-828b-ac9123310bef	admin@dectra.com	$2b$10$qVxtw/s3THUgvM8Dk1Qz6O9WMbdZfjd.Pm2kr4J2NpeQyrHb8qXZ.	Administrador	ADMIN	ATIVO	{"kpis": {"edit": true, "view": true}, "kanban": {"edit": true, "view": true}, "clientes": {"edit": true, "view": true}, "contratos": {"edit": true, "view": true}, "dashboard": {"edit": true, "view": true}, "contas_pagar": {"edit": true, "view": true}, "contas_receber": {"edit": true, "view": true}, "dashboard_financeiro": {"edit": true, "view": true}}	\N	\N	2026-09-01 22:49:58.243089	2026-09-01 22:49:58.243089
\.


--
-- Name: customers PK_133ec679a801fab5e070f73d3ea; Type: CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY (id);


--
-- Name: cash_flow_forecasts PK_2961ff66567c1806f3c19b6365f; Type: CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.cash_flow_forecasts
    ADD CONSTRAINT "PK_2961ff66567c1806f3c19b6365f" PRIMARY KEY (id);


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
-- Name: recurring_expenses PK_592b47923f3bdb6035439182e66; Type: CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.recurring_expenses
    ADD CONSTRAINT "PK_592b47923f3bdb6035439182e66" PRIMARY KEY (id);


--
-- Name: receipts PK_5e8182d7c29e023da6e1ff33bfe; Type: CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT "PK_5e8182d7c29e023da6e1ff33bfe" PRIMARY KEY (id);


--
-- Name: expense_types PK_84c519d5ded69fbf55ab41910df; Type: CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.expense_types
    ADD CONSTRAINT "PK_84c519d5ded69fbf55ab41910df" PRIMARY KEY (id);


--
-- Name: expenses PK_94c3ceb17e3140abc9282c20610; Type: CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "PK_94c3ceb17e3140abc9282c20610" PRIMARY KEY (id);


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
-- Name: backups PK_ca30ff369eddfc7dac3b35d0d3c; Type: CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.backups
    ADD CONSTRAINT "PK_ca30ff369eddfc7dac3b35d0d3c" PRIMARY KEY (id);


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
-- Name: receipts UQ_ae91d6f7ca67ed5bf73177430d7; Type: CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT "UQ_ae91d6f7ca67ed5bf73177430d7" UNIQUE ("receiptNumber");


--
-- Name: payables FK_5332029d707c2f8e4fe848cbf1c; Type: FK CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.payables
    ADD CONSTRAINT "FK_5332029d707c2f8e4fe848cbf1c" FOREIGN KEY ("recurringExpenseId") REFERENCES public.recurring_expenses(id) ON DELETE SET NULL;


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
-- Name: payables FK_f3286cd173c23784dc20bb7d47b; Type: FK CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.payables
    ADD CONSTRAINT "FK_f3286cd173c23784dc20bb7d47b" FOREIGN KEY ("expenseId") REFERENCES public.expenses(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict mb3c7YCmP7Eki93clBzSKMJhJePauGbzehmJIQScNSwHrBj7sMXJ4AGk0UaHZqA

