--
-- PostgreSQL database dump
--

\restrict WVaJvaE4yaxcrtVA7OSWXlI8xmmHBoybq5aGBCNw3Pn2ustz1pudN5UT25eQdUv

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
-- Name: financial_categories_type_enum; Type: TYPE; Schema: public; Owner: dectra
--

CREATE TYPE public.financial_categories_type_enum AS ENUM (
    'RECEITA',
    'DESPESA'
);


ALTER TYPE public.financial_categories_type_enum OWNER TO dectra;

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
-- Name: financial_categories; Type: TABLE; Schema: public; Owner: dectra
--

CREATE TABLE public.financial_categories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    type public.financial_categories_type_enum NOT NULL,
    description character varying,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.financial_categories OWNER TO dectra;

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
    "paymentMethod" character varying(50),
    "contractId" uuid,
    type character varying
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
    description text NOT NULL,
    amount numeric(12,2) NOT NULL,
    "paidAmount" numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    "dueDate" date NOT NULL,
    "paidAt" date,
    status public.receivables_status_enum DEFAULT 'PENDENTE'::public.receivables_status_enum NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    category character varying,
    type character varying,
    "contractId" uuid
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
f3370349-b586-4371-bf84-6c278227deb4	backup_2026-09-17T06-00-00.sql	D:\\dectracrm-cloud\\backend\\backups\\backup_2026-09-17T06-00-00.sql	58356	automatic	SUCCESS	\N	564	system	2026-09-17 06:00:00.676535
4e2b0259-a246-470c-ae91-794b5d346f0c	in_progress		0	automatic	IN_PROGRESS	\N	\N	system	2026-09-18 06:00:00.35892
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
45008448-f22a-4041-9409-f6bef64ab65e	395f1a0f-934b-4d02-a96d-4cbffc2f91d4	SERVICO	7046.75	2025-04-25	\N	2025-04-10	ATIVO	1	MENSAL	À VISTA	UFV Panamá - 24/04/2025	2026-09-17 12:57:56.776433	2026-09-17 12:57:56.776433
13210761-d111-47f7-8497-96c9acb21b1e	395f1a0f-934b-4d02-a96d-4cbffc2f91d4	SERVICO	25423.63	2025-04-28	\N	2025-04-10	ATIVO	1	MENSAL	À VISTA	UFV Paranoá - 27/04/2025	2026-09-17 13:02:34.040955	2026-09-17 13:02:34.040955
0580da98-97d1-4860-ad75-2071312fbd44	395f1a0f-934b-4d02-a96d-4cbffc2f91d4	SERVICO	14073.33	2025-04-28	\N	2025-04-10	ATIVO	1	MENSAL	À VISTA	UFV Rio Monte I - 27/04/2025	2026-09-17 13:03:02.560801	2026-09-17 13:03:02.560801
4bf0f050-1cdd-48c3-807f-49c74f7bfe1e	395f1a0f-934b-4d02-a96d-4cbffc2f91d4	SERVICO	13785.00	2026-09-17	\N	2026-09-10	ATIVO	1	MENSAL	À VISTA	UFV Rio Bonito - 16/09/2026	2026-09-17 13:03:13.32176	2026-09-17 13:03:13.32176
2e9f93dc-15c0-430d-9c39-9ef34736a729	395f1a0f-934b-4d02-a96d-4cbffc2f91d4	SERVICO	1686.35	2025-04-28	\N	2025-04-10	ATIVO	1	MENSAL	À VISTA	Araçu I - Grampos - 27/04/2025	2026-09-17 13:04:08.676934	2026-09-17 13:04:08.676934
f0c13842-f99e-44bd-9ab9-880efa3f274d	c94e8c44-b9da-4471-9a30-3c3257920ef1	SERVICO	3846.48	2025-07-07	\N	2025-07-10	ATIVO	1	MENSAL	À VISTA	UFV Morrinhos - 06/07/2025	2026-09-17 13:07:13.316928	2026-09-17 13:07:13.316928
5b4a6de4-0830-478e-8fa4-6a40f0fe35e5	c0bb8dbe-4876-41be-bc3d-90a57728837f	SERVICO	6977.60	2025-07-04	\N	2025-07-10	ATIVO	1	MENSAL	À VISTA	UFV Abadiânia - 03/07/2025	2026-09-17 13:07:46.644296	2026-09-17 13:07:46.644296
33eb4eca-c75e-470b-b976-964dc23452a9	395f1a0f-934b-4d02-a96d-4cbffc2f91d4	SERVICO	3482.90	2025-08-12	\N	2025-08-10	ATIVO	1	MENSAL	À VISTA	UFV City - 11/08/2025	2026-09-17 13:08:33.320168	2026-09-17 13:08:33.320168
a6a4d8cc-41b9-4fdd-a5a0-ca84c063d07c	53f14e7a-2bfa-4d53-923d-0d43dcc68e19	SERVICO	450.00	2025-08-12	\N	2025-08-10	ATIVO	1	MENSAL	À VISTA	Rancho Jatobá - 11/08/2025	2026-09-17 13:09:09.356038	2026-09-17 13:09:09.356038
ff4a2864-1600-4548-9a6e-dffa0a9ebf90	0ab31fb5-25e1-46a8-bd33-2fb662837466	SERVICO	1250.00	2025-09-10	\N	2025-09-10	ATIVO	1	MENSAL	À VISTA	Treinamento - 09/09/2025	2026-09-17 13:10:46.325709	2026-09-17 13:10:46.325709
170c4cab-0415-4c2b-8aec-a5f0d88a67d8	395f1a0f-934b-4d02-a96d-4cbffc2f91d4	SERVICO	17577.14	2025-09-19	\N	2025-09-10	ATIVO	1	MENSAL	À VISTA	Araguatins - 18/09/2025	2026-09-17 13:11:07.192403	2026-09-17 13:11:07.192403
ea45a395-136d-4766-b95f-72c4a897597a	0ab31fb5-25e1-46a8-bd33-2fb662837466	SERVICO	34291.35	2026-03-17	\N	2026-03-10	ATIVO	1	MENSAL	À VISTA	Irecê 0 - 16/03/2026	2026-09-17 13:11:31.914638	2026-09-17 13:11:31.914638
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.customers (id, name, "companyName", cnpj, cpf, address, city, state, cep, "contactName", "contactPhone", "contactEmail", status, "createdAt", "updatedAt") FROM stdin;
395f1a0f-934b-4d02-a96d-4cbffc2f91d4	Sigma Engenharia	Sigma			\N	Goiânia	GO	\N	Gabriel Carrijo		gabriel@sigmaengenharia.com.br	ATIVO	2026-09-02 18:57:09.286805	2026-09-02 18:58:01.578342
6c4bcad5-1612-44ed-a557-fde39cad1a76	BC	BC Energia			\N	Goiânia	GO	\N	Paulo			ATIVO	2026-09-02 23:32:37.85261	2026-09-02 23:35:38.381806
c94e8c44-b9da-4471-9a30-3c3257920ef1	UFV Morrinhos	helio	\N	\N	\N	\N	\N	\N	\N	\N	\N	ATIVO	2026-09-17 13:07:12.969404	2026-09-17 13:07:12.969404
c0bb8dbe-4876-41be-bc3d-90a57728837f	UFV Abadiânia	solargreen	\N	\N	\N	\N	\N	\N	\N	\N	\N	ATIVO	2026-09-17 13:07:46.63392	2026-09-17 13:07:46.63392
53f14e7a-2bfa-4d53-923d-0d43dcc68e19	Rancho Jatobá	ecoplast	\N	\N	\N	\N	\N	\N	\N	\N	\N	ATIVO	2026-09-17 13:09:09.346623	2026-09-17 13:09:09.346623
0ab31fb5-25e1-46a8-bd33-2fb662837466	Treinamento	gali energia	\N	\N	\N	\N	\N	\N	\N	\N	\N	ATIVO	2026-09-17 13:10:46.31233	2026-09-17 13:10:46.31233
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
-- Data for Name: financial_categories; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.financial_categories (id, name, type, description, "isActive", "createdAt", "updatedAt") FROM stdin;
d4b50a33-05dc-4ce5-8964-d1220086dea9	Serviços	RECEITA	Receitas provenientes de serviços prestados	t	2026-09-17 23:17:24.832841	2026-09-17 23:17:24.832841
ec4ef4f5-544d-4d3e-b535-df3a817e7555	Produtos	RECEITA	Venda de produtos	t	2026-09-17 23:17:24.832841	2026-09-17 23:17:24.832841
97215b94-1b50-414e-80b5-23685b26145c	Consultoria	RECEITA	Receitas de consultoria	t	2026-09-17 23:17:24.832841	2026-09-17 23:17:24.832841
62572b8d-bbee-425d-b34f-8c456dfb8601	Projetos	RECEITA	Receitas de projetos específicos	t	2026-09-17 23:17:24.832841	2026-09-17 23:17:24.832841
d5d33bdc-ff8b-4f80-8c22-dff9a52a2594	Outros	RECEITA	Outras receitas	t	2026-09-17 23:17:24.832841	2026-09-17 23:17:24.832841
ef4a1ef3-21d6-48e3-b215-5057a041fad2	Fornecedores	DESPESA	Pagamentos a fornecedores	t	2026-09-17 23:17:24.832841	2026-09-17 23:17:24.832841
94897f89-370b-4608-bb42-d49281c65ce4	Impostos	DESPESA	Tributos e impostos	t	2026-09-17 23:17:24.832841	2026-09-17 23:17:24.832841
c609901c-ce30-465d-a824-19787a0bcb93	Folha	DESPESA	Pagamentos de salários e encargos	t	2026-09-17 23:17:24.832841	2026-09-17 23:17:24.832841
9aef772c-a285-49f6-a86c-a3ebb51a1da4	Aluguel	DESPESA	Despesas com aluguel	t	2026-09-17 23:17:24.832841	2026-09-17 23:17:24.832841
58c9a604-b79b-4082-b598-2914539ada77	Marketing	DESPESA	Despesas com publicidade e marketing	t	2026-09-17 23:17:24.832841	2026-09-17 23:17:24.832841
824dcfbd-57b8-47ee-b72c-b300b39e9e33	Tecnologia	DESPESA	Softwares, hospedagem e equipamentos	t	2026-09-17 23:17:24.832841	2026-09-17 23:17:24.832841
c7d1381b-c74d-45c4-9b22-2dbc94036e4b	Outros	DESPESA	Outras despesas	t	2026-09-17 23:17:24.832841	2026-09-17 23:17:24.832841
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
5e91bd7f-4b58-4bd0-9e49-b0d94d6c7aef	UFV Panamá	Sigma				7046.75	\N	\N	\N	2026-09-01 22:52:34.443648	2026-09-17 12:57:56.833343	FECHADO_GANHO	f	\N	\N
3ce424fa-b1e2-4719-ac94-86d75b87d50e	Fazenda Modelo	Sigma				576.40	\N	\N	\N	2026-09-01 22:52:34.456407	2026-09-03 09:56:43.527846	NEGOCIACAO	f	\N	\N
8b20b7ce-7085-4a98-9f7a-7adb1da01b94	UFV Paranoá	Sigma				25423.63	\N	\N	\N	2026-09-01 22:52:34.44678	2026-09-17 13:02:34.063329	FECHADO_GANHO	f	\N	\N
c2134081-65df-40d8-a80c-64dfd8052297	UFV Rio Monte I	Sigma				14073.33	\N	\N	\N	2026-09-01 22:52:34.449987	2026-09-17 13:03:02.587056	FECHADO_GANHO	f	\N	\N
85b3a4c0-ad8b-40d3-89e5-4b94656fee3b	Araçu I - Grampos	Sigma				1686.35	\N	\N	\N	2026-09-01 22:52:34.45946	2026-09-17 13:04:08.774727	FECHADO_GANHO	f	\N	\N
fd194f77-7e06-435d-bf59-0ea525155a5a	UFV Rio Bonito	Sigma				13785.00	\N	\N	\N	2026-09-01 22:52:34.452934	2026-09-17 13:03:33.380736	FECHADO_GANHO	f	\N	\N
dd69eb3b-57fb-45f1-94af-a2a6ed20b431	UFV Morrinhos	Helio				3846.48	\N	\N	\N	2026-09-01 22:52:34.46237	2026-09-17 13:07:13.332458	FECHADO_GANHO	f	\N	\N
a1ecff0b-f690-4e01-a41e-ec78c37092c4	UFV Abadiânia	SolarGreen				6977.60	\N	\N	\N	2026-09-01 22:52:34.465966	2026-09-17 13:07:46.663433	FECHADO_GANHO	f	\N	\N
586ff674-4180-41ae-83e9-c9a2cb926f69	UFV City	Sigma				3482.90	\N	\N	\N	2026-09-01 22:52:34.468759	2026-09-17 13:08:33.342653	FECHADO_GANHO	f	\N	\N
f9873961-9e54-41fd-a8e6-1b64879cd09a	Rancho Jatobá	Ecoplast				450.00	\N	\N	\N	2026-09-01 22:52:34.471895	2026-09-17 13:09:09.373385	FECHADO_GANHO	f	\N	\N
edc4b35a-6f21-4c33-99f9-d96283a3ede9	Treinamento	Gali Energia				1250.00	\N	\N	\N	2026-09-01 22:52:34.474734	2026-09-17 13:10:46.347634	FECHADO_GANHO	f	\N	\N
7740aeb1-6ac7-45d9-b919-d99b9c2443d6	Irecê 0	Gali Energia				34291.35	\N	\N	\N	2026-09-01 22:52:34.480545	2026-09-17 13:11:31.935186	FECHADO_GANHO	f	\N	\N
3f5e752b-775a-40fe-b0a1-cb662e837c7e	Araguatins	Sigma				17577.14	\N	\N	\N	2026-09-01 22:52:34.477748	2026-09-17 13:11:07.208517	FECHADO_GANHO	f	\N	\N
37cd57f1-15aa-4e2a-92b8-fc0ef7aa634c	Irecê 3	Gali Energia				0.00	\N	\N	\N	2026-09-01 22:52:34.483308	2026-09-03 09:57:51.023406	QUALIFICACAO	f	\N	\N
afd4d20d-99b2-42f5-b44b-78eff6499211	UFV Ibiúna	Sigma				0.00	\N	\N	\N	2026-09-01 22:52:34.486352	2026-09-03 09:57:56.390991	NEGOCIACAO	f	\N	\N
44eec6e2-de03-4489-a616-8a195dce46d5	Contato realizado.	Comerc	Emerson Viana	31 989812552		0.00	\N	\N	\N	2026-09-01 23:01:16.353494	2026-09-03 09:58:01.166247	QUALIFICACAO	f	\N	\N
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

COPY public.payables (id, amount, "dueDate", category, notes, "recurringExpenseId", "createdAt", "updatedAt", "paidAt", "expenseId", "generatesReceipt", description, status, "paymentMethod", "contractId", type) FROM stdin;
6c983159-3639-4d94-9cd1-57cb92840953	223.03	2024-08-14	\N	\N	\N	2026-09-17 17:50:00.405003	2026-09-17 17:50:00.405003	2024-08-14	\N	f	Pix enviado: "Cp :60701190-GOIANIA PREFEITURA MUNICIPAL GABINETE"	PAGO	\N	\N	\N
9c6b8b64-3fbe-41d4-b599-41726306c25b	202.92	2024-08-19	\N	\N	\N	2026-09-17 17:50:00.416461	2026-09-17 17:50:00.416461	2024-08-19	\N	f	Pagamento de Convenio PREFEITURA MUNICIPAL GOIANIA GO	PAGO	\N	\N	\N
dd4784ca-71a5-452c-a9e1-08a48c0050b6	142.00	2024-08-22	\N	\N	\N	2026-09-17 17:50:00.438491	2026-09-17 17:50:00.438491	2024-08-22	\N	f	Pagamento efetuado INSTITUTO NACIONAL DA PROPRIEDADE INDUSTRIAL . INP	PAGO	\N	\N	\N
49d8abb8-8668-4878-91bb-b0c5ddf286cc	246.96	2024-10-11	\N	\N	\N	2026-09-17 17:50:00.457027	2026-09-17 17:50:00.457027	2024-10-11	\N	f	Pagamento de Convenio SIMPLES NACIONAL	PAGO	\N	\N	\N
85d35e5e-bf37-492d-a054-b9ab51eeb158	875.00	2025-03-21	\N	\N	\N	2026-09-17 17:50:00.468907	2026-09-17 17:50:00.468907	2025-03-21	\N	f	Pix enviado: "Cp :18236120-Nicole Liecheski"	PAGO	\N	\N	\N
db7a41e6-bb1d-49f6-a509-5df1d9c2c4e4	211.72	2025-03-21	\N	\N	\N	2026-09-17 17:50:00.479544	2026-09-17 17:50:00.479544	2025-03-21	\N	f	Pix enviado: "Cp :00000000-RECEITA FEDERAL"	PAGO	\N	\N	\N
90768d0f-2edf-483e-b037-c9db3012f9cd	875.00	2025-04-08	\N	\N	\N	2026-09-17 17:50:00.492581	2026-09-17 17:50:00.492581	2025-04-08	\N	f	Pix enviado: "Cp :18236120-Nicole Liecheski"	PAGO	\N	\N	\N
e958606d-91ef-4679-90c5-29a0c69d39b0	9347.58	2025-04-22	\N	\N	\N	2026-09-17 17:50:00.50663	2026-09-17 17:50:00.50663	2025-04-22	\N	f	Pix enviado: "Cp :60701190-Grupo Sigma Engenharia"	PAGO	\N	\N	\N
23c3a39f-df66-4d2a-a5bc-84e8ff184899	1150.00	2025-04-22	\N	\N	\N	2026-09-17 17:50:00.51764	2026-09-17 17:50:00.51764	2025-04-22	\N	f	Pix enviado: "Cp :60701190-Grazielly Vieira Lima"	PAGO	\N	\N	\N
86c6b112-08e6-4fb9-a51a-9410247409de	31619.91	2025-05-02	\N	\N	\N	2026-09-17 17:50:00.530139	2026-09-17 17:50:00.530139	2025-05-02	\N	f	Pix enviado: "Cp :00000000-Nw Drones Comercio E Manutencao de Drones LTDA"	PAGO	\N	\N	\N
20fd8b7a-b691-4721-9573-552751675c97	875.00	2025-05-07	\N	\N	\N	2026-09-17 17:50:00.543778	2026-09-17 17:50:00.543778	2025-05-07	\N	f	Pix enviado: "Cp :00000000-Nicole Liecheski"	PAGO	\N	\N	\N
59aec834-9296-44f1-aa78-5f726b2993d6	1150.00	2025-05-21	\N	\N	\N	2026-09-17 17:50:00.557034	2026-09-17 17:50:00.557034	2025-05-21	\N	f	Pix enviado: "Cp :60701190-Grazielly Vieira Lima"	PAGO	\N	\N	\N
8e132808-2db2-4032-9c87-2c5478a71c7c	3853.13	2025-05-21	\N	\N	\N	2026-09-17 17:50:00.571468	2026-09-17 17:50:00.571468	2025-05-21	\N	f	Pix enviado: "Cp :00000000-RECEITA FEDERAL"	PAGO	\N	\N	\N
aed7bea2-78e1-431c-b1c7-361f2f2aeab9	6919.89	2025-06-02	\N	\N	\N	2026-09-17 17:50:00.58396	2026-09-17 17:50:00.58396	2025-06-02	\N	f	Pix enviado: "Cp :13884775-Magazine Luiza Marketplace"	PAGO	\N	\N	\N
75dfec24-8b63-4abe-b410-d28a3545ae3c	960.00	2025-06-06	\N	\N	\N	2026-09-17 17:50:00.598415	2026-09-17 17:50:00.598415	2025-06-06	\N	f	Pix enviado: "Cp :15111975-COMPANY HERO LTDA"	PAGO	\N	\N	\N
8b37a5b5-d378-4cfb-82e6-a71cc758d263	875.00	2025-06-10	\N	\N	\N	2026-09-17 17:50:00.612707	2026-09-17 17:50:00.612707	2025-06-10	\N	f	Pix enviado: "Cp :18236120-Nicole Liecheski"	PAGO	\N	\N	\N
d0ec1d3c-9f68-47ba-b5d7-ee4a9bcc819b	1150.00	2025-06-24	\N	\N	\N	2026-09-17 17:50:00.626574	2026-09-17 17:50:00.626574	2025-06-24	\N	f	Pix enviado: "Cp :60701190-Grazielly Vieira Lima"	PAGO	\N	\N	\N
20f50895-4c11-4810-8dc3-fb32defa6ac2	35.00	2025-07-08	\N	\N	\N	2026-09-17 17:50:00.636143	2026-09-17 17:50:00.636143	2025-07-08	\N	f	Pagamento efetuado: "Pagamento fatura cartao Inter"	PAGO	\N	\N	\N
83762da1-b3db-4b90-b8e1-38adfb968467	1791.17	2025-07-14	\N	\N	\N	2026-09-17 17:50:00.650205	2026-09-17 17:50:00.650205	2025-07-14	\N	f	Pix enviado: "Cp :10573521-Cleiber Nichida"	PAGO	\N	\N	\N
7b9b4d63-b5e1-428c-a8fb-47280210c505	875.00	2025-07-14	\N	\N	\N	2026-09-17 17:50:00.661722	2026-09-17 17:50:00.661722	2025-07-14	\N	f	Pix enviado: "Cp :18236120-Nicole Liecheski"	PAGO	\N	\N	\N
7551d737-834c-418a-a0d0-adab5eb9fabb	238.56	2025-07-17	\N	\N	\N	2026-09-17 17:50:00.672879	2026-09-17 17:50:00.672879	2025-07-17	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N	\N	\N
a62e28da-f843-47a0-b7d9-9a567f27ff03	120.84	2025-07-17	\N	\N	\N	2026-09-17 17:50:00.684271	2026-09-17 17:50:00.684271	2025-07-17	\N	f	Pix enviado: "Cp :10573521-Cleiber Nichida"	PAGO	\N	\N	\N
d925d03f-f72c-4735-b8c5-343a564f79fb	103.03	2025-07-22	\N	\N	\N	2026-09-17 17:50:00.697723	2026-09-17 17:50:00.697723	2025-07-22	\N	f	Pix enviado: "Cp :00000000-CONSELHO REGIONAL DE ENGENHARIA E AGRONOMIA DE GOIAS"	PAGO	\N	\N	\N
6fd0691a-1d3e-4ad9-8d35-b4e8e3b9e4eb	271.47	2025-07-22	\N	\N	\N	2026-09-17 17:50:00.72844	2026-09-17 17:50:00.72844	2025-07-22	\N	f	Pix enviado: "Cp :00000000-CONSELHO REGIONAL DE ENGENHARIA E AGRONOMIA DE GOIAS"	PAGO	\N	\N	\N
d2383659-a3f3-4572-a57c-27ac36913427	4814.05	2025-07-24	\N	\N	\N	2026-09-17 17:50:00.765138	2026-09-17 17:50:00.765138	2025-07-24	\N	f	Pix enviado: "Cp :00000000-RECEITA FEDERAL"	PAGO	\N	\N	\N
418a7d10-79b2-4e4e-89d9-329b9aaae03b	6660.00	2025-07-25	\N	\N	\N	2026-09-17 17:50:00.778857	2026-09-17 17:50:00.778857	2025-07-25	\N	f	Pix enviado: "Cp :00000000-NW DRONES COMERCIO E MANUTENCAO DE DRONES LTDA"	PAGO	\N	\N	\N
3f4a149f-0df3-497d-b1a9-c9d8dec30bf7	129.70	2025-07-31	\N	\N	\N	2026-09-17 17:50:00.792509	2026-09-17 17:50:00.792509	2025-07-31	\N	f	Pix enviado: "Cp :60701190-GOIANIA PREFEITURA MUNICIPAL GABINETE DO PREFEITO"	PAGO	\N	\N	\N
b185c6d4-682e-4230-afe7-6ceb4a806f62	199.99	2025-08-06	\N	\N	\N	2026-09-17 17:50:00.805664	2026-09-17 17:50:00.805664	2025-08-06	\N	f	Pix enviado: "Cp :60701190-TOBELLI COMERCIO DE CALCADOS LTDA"	PAGO	\N	\N	\N
22b93e84-4c33-4004-823c-5a190f2a8917	73.10	2025-08-11	\N	\N	\N	2026-09-17 17:50:00.815367	2026-09-17 17:50:00.815367	2025-08-11	\N	f	Pagamento efetuado: "Pagamento fatura cartao Inter"	PAGO	\N	\N	\N
4c3cf31d-fd8d-4c93-8548-8bafac5cc51c	649.44	2025-08-21	\N	\N	\N	2026-09-17 17:50:00.829413	2026-09-17 17:50:00.829413	2025-08-21	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N	\N	\N
bcd8a178-2a63-439f-93f6-ad223dc249f2	129.70	2025-08-25	\N	\N	\N	2026-09-17 17:50:00.843394	2026-09-17 17:50:00.843394	2025-08-25	\N	f	Pix enviado: "Cp :60701190-GOIANIA PREFEITURA MUNICIPAL GABINETE DO PREFEITO"	PAGO	\N	\N	\N
13a5b936-13fc-497f-983d-a457925db8bb	129.70	2025-08-26	\N	\N	\N	2026-09-17 17:50:00.856354	2026-09-17 17:50:00.856354	2025-08-26	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N	\N	\N
5f0f814f-bf04-43d8-82c0-0b9b2b137e59	1150.00	2025-08-27	\N	\N	\N	2026-09-17 17:50:00.869934	2026-09-17 17:50:00.869934	2025-08-27	\N	f	Pix enviado: "Cp :60701190-Grazielly Vieira Lima"	PAGO	\N	\N	\N
b77b2010-1a0c-46b5-84dd-6aafbea37157	338.00	2025-09-04	\N	\N	\N	2026-09-17 17:50:00.881407	2026-09-17 17:50:00.881407	2025-09-04	\N	f	Pagamento de Convenio: "DARE - DEMAIS ORGAOS GO"	PAGO	\N	\N	\N
c4c505b5-6a50-45f3-80e6-5898a156e11c	294.85	2025-09-04	\N	\N	\N	2026-09-17 17:50:00.895683	2026-09-17 17:50:00.895683	2025-09-04	\N	f	Pagamento efetuado: "CONSELHO NACIONAL DE DESENVOLVIMENTO CIENTIFICO E"	PAGO	\N	\N	\N
c03a5327-a316-4920-ab63-afdac09ba1b3	463.98	2025-09-11	\N	\N	\N	2026-09-17 17:50:00.909459	2026-09-17 17:50:00.909459	2025-09-11	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N	\N	\N
9bd1d639-43e9-4a2b-bb3b-bad44d7e6be1	1476.72	2025-09-11	\N	\N	\N	2026-09-17 17:50:00.922309	2026-09-17 17:50:00.922309	2025-09-11	\N	f	Pix enviado: "Cp :10573521-Cleiber Nichida"	PAGO	\N	\N	\N
6aab1b15-ca8b-408e-b907-56a68b701b9b	73.10	2025-09-12	\N	\N	\N	2026-09-17 17:50:00.934665	2026-09-17 17:50:00.934665	2025-09-12	\N	f	Pagamento efetuado: "Pagamento fatura cartao Inter"	PAGO	\N	\N	\N
b2b3fc2c-e135-48ff-9689-0e8c1c61d833	5294.46	2025-09-12	\N	\N	\N	2026-09-17 17:50:00.946111	2026-09-17 17:50:00.946111	2025-09-12	\N	f	Pix enviado: "Cp :90400888-IATA INTERNATIONAL AIR TRANSPORT ASSOCIATION"	PAGO	\N	\N	\N
e05e8eb8-f1e5-49b7-92f3-b0d6e2b4cd49	400.00	2025-09-24	\N	\N	\N	2026-09-17 17:50:00.960137	2026-09-17 17:50:00.960137	2025-09-24	\N	f	Pix enviado: "Cp :06332931-Kleber Ramos de Morais"	PAGO	\N	\N	\N
b28a934c-a2c1-4c6e-8d02-8d6bd6c683e7	100.00	2025-09-24	\N	\N	\N	2026-09-17 17:50:00.976332	2026-09-17 17:50:00.976332	2025-09-24	\N	f	Pagamento efetuado: "Pagamento fatura cartao Inter"	PAGO	\N	\N	\N
b2bb0a65-fc98-4085-9336-8b43cc63c81d	1150.00	2025-09-24	\N	\N	\N	2026-09-17 17:50:00.989496	2026-09-17 17:50:00.989496	2025-09-24	\N	f	Pix enviado: "Cp :60701190-Grazielly Vieira Lima"	PAGO	\N	\N	\N
83d2d347-e481-451e-859f-bfc68dfef459	1849.03	2025-09-24	\N	\N	\N	2026-09-17 17:50:01.002391	2026-09-17 17:50:01.002391	2025-09-24	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N	\N	\N
64cf653c-b49c-482d-ba5c-f2a084730337	2500.00	2025-09-26	\N	\N	\N	2026-09-17 17:50:01.0157	2026-09-17 17:50:01.0157	2025-09-26	\N	f	Pix enviado: "Cp :10573521-Cleiber Nichida"	PAGO	\N	\N	\N
d6013de2-7a38-4b3c-90af-1aecd8743c2f	3500.00	2025-09-26	\N	\N	\N	2026-09-17 17:50:01.027699	2026-09-17 17:50:01.027699	2025-09-26	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N	\N	\N
586de3b7-f70a-49bb-8afd-d6da811083a0	40.85	2025-10-01	\N	\N	\N	2026-09-17 17:50:01.039383	2026-09-17 17:50:01.039383	2025-10-01	\N	f	Compra no debito: "No estabelecimento DL *GOOGLE CLOUD Rvw3P Sao Pablo BRA"	PAGO	\N	\N	\N
68b8ddda-3d59-43b2-998e-f07becaf8b19	972.60	2025-10-09	\N	\N	\N	2026-09-17 17:50:01.055208	2026-09-17 17:50:01.055208	2025-10-09	\N	f	Pagamento efetuado: "Pagamento fatura cartao Inter"	PAGO	\N	\N	\N
c6efbe55-5b40-4234-aed6-dfa8a0e53728	875.00	2025-10-09	\N	\N	\N	2026-09-17 17:50:01.069704	2026-09-17 17:50:01.069704	2025-10-09	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N	\N	\N
df0367cd-e155-4cfa-ad56-2eeb7aade08d	78.96	2025-10-14	\N	\N	\N	2026-09-17 17:50:01.086682	2026-09-17 17:50:01.086682	2025-10-14	\N	f	Pix enviado: "Cp :10573521-Cleiber Nichida"	PAGO	\N	\N	\N
2bd9874a-7335-418b-a917-2e94294c68f2	3500.00	2025-10-15	\N	\N	\N	2026-09-17 17:50:01.099167	2026-09-17 17:50:01.099167	2025-10-15	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N	\N	\N
65f020d8-a9eb-4e88-b4df-a58432618f04	2500.00	2025-10-15	\N	\N	\N	2026-09-17 17:50:01.115093	2026-09-17 17:50:01.115093	2025-10-15	\N	f	Pix enviado: "Cp :10573521-Cleiber Nichida"	PAGO	\N	\N	\N
0446cb9b-a9e9-42df-b1ea-553c68cb6050	112.46	2025-10-20	\N	\N	\N	2026-09-17 17:50:01.12849	2026-09-17 17:50:01.12849	2025-10-20	\N	f	Pix enviado: "Cp :60701190-RECEITA FEDERAL"	PAGO	\N	\N	\N
df21221b-ee46-404f-81d3-68f33405b1a3	13.73	2025-10-20	\N	\N	\N	2026-09-17 17:50:01.141781	2026-09-17 17:50:01.141781	2025-10-20	\N	f	Pix enviado: "Cp :00000000-RECEITA FEDERAL"	PAGO	\N	\N	\N
33aeaf18-77c8-43d6-ac09-ac6ddf1c7ce8	254.72	2025-10-23	\N	\N	\N	2026-09-17 17:50:01.157816	2026-09-17 17:50:01.157816	2025-10-23	\N	f	Pix enviado: "Cp :18236120-Dectra Tecnologia LTDA"	PAGO	\N	\N	\N
b2bf178a-f209-45a6-8270-382b169f9d7d	400.00	2025-10-23	\N	\N	\N	2026-09-17 17:50:01.169639	2026-09-17 17:50:01.169639	2025-10-23	\N	f	Pix enviado: "Cp :06332931-Kleber Ramos de Morais"	PAGO	\N	\N	\N
4ea09154-7bf7-4f73-a0a5-61254ca8ce2f	1150.00	2025-10-23	\N	\N	\N	2026-09-17 17:50:01.186473	2026-09-17 17:50:01.186473	2025-10-23	\N	f	Pix enviado: "Cp :60701190-Grazielly Vieira Lima"	PAGO	\N	\N	\N
6dae4e2b-e58e-4adc-a14c-2b7187348e97	1684.68	2025-10-26	\N	\N	\N	2026-09-17 17:50:01.198158	2026-09-17 17:50:01.198158	2025-10-26	\N	f	Pix enviado: "Cp :60701190-DECOLAR COM LTDA"	PAGO	\N	\N	\N
c708ba58-95ef-4a81-8941-355278698630	713.15	2025-11-03	\N	\N	\N	2026-09-17 17:50:01.213766	2026-09-17 17:50:01.213766	2025-11-03	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N	\N	\N
49ea60bf-45a7-409d-a3fd-5afeaa4cc443	1212.97	2025-11-10	\N	\N	\N	2026-09-17 17:50:01.225794	2026-09-17 17:50:01.225794	2025-11-10	\N	f	Pagamento efetuado: "Pagamento fatura cartao Inter"	PAGO	\N	\N	\N
df21b6f5-c9bf-420e-9f7e-8f1ca6d3c153	3500.00	2025-11-11	\N	\N	\N	2026-09-17 17:50:01.235656	2026-09-17 17:50:01.235656	2025-11-11	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N	\N	\N
6b0ca6e9-088f-4feb-be7e-efd472c5c7a3	288.00	2025-11-11	\N	\N	\N	2026-09-17 17:50:01.249305	2026-09-17 17:50:01.249305	2025-11-11	\N	f	Pix enviado: "Cp :10573521-Cleiber Nichida"	PAGO	\N	\N	\N
52be9692-40c1-47c2-b923-23126d83dca3	2500.00	2025-11-11	\N	\N	\N	2026-09-17 17:50:01.261019	2026-09-17 17:50:01.261019	2025-11-11	\N	f	Pix enviado: "Cp :10573521-Cleiber Nichida"	PAGO	\N	\N	\N
a9c1721b-262e-4251-9808-1df3c5e1a60d	400.00	2025-11-21	\N	\N	\N	2026-09-17 17:50:01.272543	2026-09-17 17:50:01.272543	2025-11-21	\N	f	Pix enviado: "Cp :06332931-Kleber Ramos de Morais"	PAGO	\N	\N	\N
324efcea-32ea-413c-a5c0-8d6da84beed3	2057.49	2025-11-21	\N	\N	\N	2026-09-17 17:50:01.289595	2026-09-17 17:50:01.289595	2025-11-21	\N	f	Pix enviado: "Cp :00000000-RECEITA FEDERAL"	PAGO	\N	\N	\N
fff08681-935d-4920-b327-ec8ab2043a87	1150.00	2025-12-03	\N	\N	\N	2026-09-17 17:50:01.299467	2026-09-17 17:50:01.299467	2025-12-03	\N	f	Pix enviado: "Cp :60701190-Grazielly Vieira Lima"	PAGO	\N	\N	\N
b8c178eb-e3e9-489c-bde1-5a62de12c70e	2500.00	2025-12-09	\N	\N	\N	2026-09-17 17:50:01.312781	2026-09-17 17:50:01.312781	2025-12-09	\N	f	Pix enviado: "Cp :10573521-Cleiber Nichida"	PAGO	\N	\N	\N
025ca498-eb28-4401-bb4b-eff234784240	3500.00	2025-12-09	\N	\N	\N	2026-09-17 17:50:01.323906	2026-09-17 17:50:01.323906	2025-12-09	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N	\N	\N
c6c1bd61-9edd-48ca-b7fe-7d1b40239634	977.68	2025-12-09	\N	\N	\N	2026-09-17 17:50:01.3366	2026-09-17 17:50:01.3366	2025-12-09	\N	f	Pagamento efetuado: "Pagamento fatura cartao Inter"	PAGO	\N	\N	\N
c76fdb03-fa48-4130-885a-815a1b7ff1a3	400.00	2025-12-23	\N	\N	\N	2026-09-17 17:50:01.349792	2026-09-17 17:50:01.349792	2025-12-23	\N	f	Pix enviado: "Cp :60701190-Kleber Ramos de Morais"	PAGO	\N	\N	\N
423ea01a-8f70-42e9-a812-6e38b87336b5	3500.00	2026-01-02	\N	\N	\N	2026-09-17 17:50:01.36453	2026-09-17 17:50:01.36453	2026-01-02	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N	\N	\N
9c219f45-4796-4c7d-b5e6-af524a8abd04	3500.00	2026-01-02	\N	\N	\N	2026-09-17 17:50:01.376263	2026-09-17 17:50:01.376263	2026-01-02	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
ce4a25fe-daa1-49b0-83e8-3c4ba06abee9	28.19	2026-01-05	\N	\N	\N	2026-09-17 17:50:01.385503	2026-09-17 17:50:01.385503	2026-01-05	\N	f	Pix enviado: "Cp :18236120-Dectra Tecnologia LTDA"	PAGO	\N	\N	\N
e6eef239-85fb-4c35-80a3-d06c2c6d0a1c	877.20	2026-01-05	\N	\N	\N	2026-09-17 17:50:01.398191	2026-09-17 17:50:01.398191	2026-01-05	\N	f	Pagamento efetuado: "Pagamento fatura cartao Inter"	PAGO	\N	\N	\N
86ef7b3d-7a1e-43ac-8b5e-99080a3ff505	877.20	2026-01-05	\N	\N	\N	2026-09-17 17:50:01.410905	2026-09-17 17:50:01.410905	2026-01-05	\N	f	Pagamento efetuado - Fatura cartão Inter	PAGO	\N	\N	\N
54fa3438-182a-416c-b7f7-fab2a1bba317	28.19	2026-01-05	\N	\N	\N	2026-09-17 17:50:01.423731	2026-09-17 17:50:01.423731	2026-01-05	\N	f	Pix enviado - Dectra Tecnologia Ltda	PAGO	\N	\N	\N
db2f60ba-1fbe-4d1b-8193-9aa334b57eb1	36.08	2026-01-05	\N	\N	\N	2026-09-17 17:50:01.435748	2026-09-17 17:50:01.435748	2026-01-05	\N	f	Pagamento de fatura	PAGO	\N	\N	\N
72be2c38-dace-44c0-be9f-1710ecaecbd5	3497.49	2026-01-06	\N	\N	\N	2026-09-17 17:50:01.448733	2026-09-17 17:50:01.448733	2026-01-06	\N	f	Aplicação - Cdb Di Liq Banco Inter S A	PAGO	\N	\N	\N
55a4925d-3ac4-471e-a9e6-985a47bb1b99	2500.00	2026-01-09	\N	\N	\N	2026-09-17 17:50:01.468639	2026-09-17 17:50:01.468639	2026-01-09	\N	f	Pix enviado: "Cp :10573521-Cleiber Nichida"	PAGO	\N	\N	\N
6917217f-808d-4869-923d-a7857dc9eac6	2500.00	2026-01-09	\N	\N	\N	2026-09-17 17:50:01.484226	2026-09-17 17:50:01.484226	2026-01-09	\N	f	Pix enviado - Cleiber Nichida	PAGO	\N	\N	\N
3ffc8d50-2b08-495a-af72-104b082f1a72	2300.00	2026-01-13	\N	\N	\N	2026-09-17 17:50:01.510922	2026-09-17 17:50:01.510922	2026-01-13	\N	f	Pix enviado: "Cp :60701190-Grazielly Vieira Lima"	PAGO	\N	\N	\N
4067db65-5329-44c7-b781-522adf40b4df	11430.45	2026-01-13	\N	\N	\N	2026-09-17 17:50:01.522374	2026-09-17 17:50:01.522374	2026-01-13	\N	f	Aplicacao: "CDB DI LIQ BANCO INTER S A"	PAGO	\N	\N	\N
0d87ddab-455a-452a-bd4b-8137937d18e6	11430.45	2026-01-13	\N	\N	\N	2026-09-17 17:50:01.534902	2026-09-17 17:50:01.534902	2026-01-13	\N	f	Aplicação - Cdb Di Liq Banco Inter S A	PAGO	\N	\N	\N
35d9e146-48e1-481b-b3a0-032a176a250d	2300.00	2026-01-13	\N	\N	\N	2026-09-17 17:50:01.545995	2026-09-17 17:50:01.545995	2026-01-13	\N	f	Pix enviado - Grazielly Vieira Lima	PAGO	\N	\N	\N
69a9a415-5d28-4cf3-9123-04624b0bd9ba	130.16	2026-01-14	\N	\N	\N	2026-09-17 17:50:01.556855	2026-09-17 17:50:01.556855	2026-01-14	\N	f	Pagamento efetuado: "DEPARTAMENTO ESTADUAL DE TRANSITO"	PAGO	\N	\N	\N
ea8da3a9-10d4-46d0-9025-74e95a00bb30	130.16	2026-01-14	\N	\N	\N	2026-09-17 17:50:01.569581	2026-09-17 17:50:01.569581	2026-01-14	\N	f	Pagamento efetuado - DEPARTAMENTO ESTADUAL DE TRANSITO	PAGO	\N	\N	\N
7b736c36-71e4-432e-97b6-7dc46dfc416e	102.55	2026-01-24	\N	\N	\N	2026-09-17 17:50:01.581945	2026-09-17 17:50:01.581945	2026-01-24	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
f700e4d3-a556-4eaf-9504-24a7db1a1935	3500.00	2026-02-06	\N	\N	\N	2026-09-17 17:50:01.594409	2026-09-17 17:50:01.594409	2026-02-06	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
56c12f75-efcb-4aaa-bb12-1a0ce7ecc7c5	45.08	2026-02-08	\N	\N	\N	2026-09-17 17:50:01.605991	2026-09-17 17:50:01.605991	2026-02-08	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
e7a9b15b-0594-42a0-957c-8e7064cef067	3700.00	2026-02-11	\N	\N	\N	2026-09-17 17:50:01.614541	2026-09-17 17:50:01.614541	2026-02-11	\N	f	Pix enviado - Cleiber Nichida	PAGO	\N	\N	\N
d25af3ea-b45c-4adc-a3cb-602b0ead57c6	1200.00	2026-02-12	\N	\N	\N	2026-09-17 17:50:01.626392	2026-09-17 17:50:01.626392	2026-02-12	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
b8300998-2ab4-4862-bdbc-e40535e41ff3	278.64	2026-02-12	\N	\N	\N	2026-09-17 17:50:01.638712	2026-09-17 17:50:01.638712	2026-02-12	\N	f	Pix enviado - Dectra Tecnologia Ltda	PAGO	\N	\N	\N
42518652-2a77-42c3-b002-a2af2f0f972f	278.63	2026-02-12	\N	\N	\N	2026-09-17 17:50:01.651024	2026-09-17 17:50:01.651024	2026-02-12	\N	f	Pagamento de fatura	PAGO	\N	\N	\N
ff201444-cc84-4540-b141-34c038df46de	800.00	2026-02-25	\N	\N	\N	2026-09-17 17:50:01.663046	2026-09-17 17:50:01.663046	2026-02-25	\N	f	Pix enviado - Kleber Ramos De Morais	PAGO	\N	\N	\N
819da541-ddce-40e0-b969-6454088ba2a8	4700.00	2026-03-07	\N	\N	\N	2026-09-17 17:50:01.67492	2026-09-17 17:50:01.67492	2026-03-07	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
c04c508c-a042-4904-88cc-3e9bec23acc9	4216.48	2026-03-07	\N	\N	\N	2026-09-17 17:50:01.686635	2026-09-17 17:50:01.686635	2026-03-07	\N	f	Pix enviado - Cleiber Nichida	PAGO	\N	\N	\N
c061ae3a-bdf7-4839-9a29-8ae54432328e	153.80	2026-03-10	\N	\N	\N	2026-09-17 17:50:01.699891	2026-09-17 17:50:01.699891	2026-03-10	\N	f	Pix enviado - Dectra Tecnologia Ltda	PAGO	\N	\N	\N
84f6eb4e-3a48-455a-b30f-59380e0e5d25	153.80	2026-03-10	\N	\N	\N	2026-09-17 17:50:01.713328	2026-09-17 17:50:01.713328	2026-03-10	\N	f	Pagamento de fatura	PAGO	\N	\N	\N
0ecb8a17-91e2-4258-abde-a7358e6eb8bb	100000.00	2026-03-26	\N	\N	\N	2026-09-17 17:50:01.725931	2026-09-17 17:50:01.725931	2026-03-26	\N	f	Aplicação - Cdb Di Liq Banco Inter Sa	PAGO	\N	\N	\N
00779478-763e-4347-b33c-b73b33aa3d3b	45.08	2026-04-02	\N	\N	\N	2026-09-17 17:50:01.737645	2026-09-17 17:50:01.737645	2026-04-02	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
a1230198-85a7-4b8a-a0ba-121e25c8b9eb	4700.00	2026-04-06	\N	\N	\N	2026-09-17 17:50:01.748961	2026-09-17 17:50:01.748961	2026-04-06	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
2b8438da-ba16-4f07-a5f6-7d2253d5f615	585.42	2026-04-08	\N	\N	\N	2026-09-17 17:50:01.762218	2026-09-17 17:50:01.762218	2026-04-08	\N	f	Pix enviado - Dectra Tecnologia Ltda	PAGO	\N	\N	\N
30ad8a67-496c-45c8-9f7d-3bfdf0b23593	285.40	2026-04-08	\N	\N	\N	2026-09-17 17:50:01.774386	2026-09-17 17:50:01.774386	2026-04-08	\N	f	Pagamento de fatura	PAGO	\N	\N	\N
e9059645-ede9-4e52-ae5e-0fafdb21bc38	3700.00	2026-04-10	\N	\N	\N	2026-09-17 17:50:01.789381	2026-09-17 17:50:01.789381	2026-04-10	\N	f	Pix enviado - Cleiber Nichida	PAGO	\N	\N	\N
e90915e0-8c97-42ea-898a-1b04da4c7893	1350.00	2026-04-15	\N	\N	\N	2026-09-17 17:50:01.80076	2026-09-17 17:50:01.80076	2026-04-15	\N	f	Pix enviado - 65166632 Wilgner Tavares De Souza Almeida	PAGO	\N	\N	\N
16692d18-32fd-4fbd-b452-0a40213aaf4d	800.00	2026-04-18	\N	\N	\N	2026-09-17 17:50:01.813839	2026-09-17 17:50:01.813839	2026-04-18	\N	f	Pix enviado - Kleber Ramos De Morais	PAGO	\N	\N	\N
9174bb2a-64d6-457d-bcc9-b0b0c12a29d6	4700.00	2026-05-08	\N	\N	\N	2026-09-17 17:50:01.825636	2026-09-17 17:50:01.825636	2026-05-08	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
f4f08b3c-0de3-47bb-94c5-c8d11e9aee6f	3700.00	2026-05-08	\N	\N	\N	2026-09-17 17:50:01.831413	2026-09-17 17:50:01.831413	2026-05-08	\N	f	Pix enviado - Cleiber Nichida	PAGO	\N	\N	\N
51ed368c-af84-431c-b5d9-00e332bd1851	207.46	2026-05-12	\N	\N	\N	2026-09-17 17:50:01.837424	2026-09-17 17:50:01.837424	2026-05-12	\N	f	Pix enviado - Nu Pagamentos Sa	PAGO	\N	\N	\N
779edcef-d5d9-4cb7-9d1c-9cb1b685eee4	1350.00	2026-05-15	\N	\N	\N	2026-09-17 17:50:01.843817	2026-09-17 17:50:01.843817	2026-05-15	\N	f	Pix enviado - 65166632 Wilgner Tavares De Souza Almeida	PAGO	\N	\N	\N
c014866e-fbd3-417b-8aea-0aeba5d551be	400.00	2026-05-21	\N	\N	\N	2026-09-17 17:50:01.849151	2026-09-17 17:50:01.849151	2026-05-21	\N	f	Pix enviado - Kleber Ramos De Morais	PAGO	\N	\N	\N
8e9fd306-e7ee-4a54-832e-141ae42524f9	144.46	2026-05-21	\N	\N	\N	2026-09-17 17:50:01.857036	2026-09-17 17:50:01.857036	2026-05-21	\N	f	Pix enviado - Receita Federal	PAGO	\N	\N	\N
19caae73-5f0a-4079-98a4-185b99081fe9	500.00	2026-05-22	\N	\N	\N	2026-09-17 17:50:01.863114	2026-09-17 17:50:01.863114	2026-05-22	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
d54148a0-cd95-4c88-8def-cbfeb93df2e7	1289.60	2026-05-22	\N	\N	\N	2026-09-17 17:50:01.869189	2026-09-17 17:50:01.869189	2026-05-22	\N	f	Pix enviado - Cleiber Nichida	PAGO	\N	\N	\N
cbebc92a-d0f7-41e7-87b6-5fbd1d86a9ca	1842.80	2026-05-30	\N	\N	\N	2026-09-17 17:50:01.876767	2026-09-17 17:50:01.876767	2026-05-30	\N	f	Pix enviado - Cleiber Nichida	PAGO	\N	\N	\N
bf0c86f1-5bfd-42a3-8eed-5054eca78b13	500.00	2026-05-30	\N	\N	\N	2026-09-17 17:50:01.88436	2026-09-17 17:50:01.88436	2026-05-30	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
d2372d6c-92bd-47ae-9711-54e74d44ecde	200.00	2026-06-04	\N	\N	\N	2026-09-17 17:50:01.890476	2026-09-17 17:50:01.890476	2026-06-04	\N	f	Pix enviado - Mundogeo Eventos E Consultoria Empres Lt	PAGO	\N	\N	\N
fdfc99da-650c-4278-807a-f4d4a90af37e	1171.51	2026-06-04	\N	\N	\N	2026-09-17 17:50:01.894624	2026-09-17 17:50:01.894624	2026-06-04	\N	f	Pix enviado - Zupper	PAGO	\N	\N	\N
22452dc8-7543-4bd3-a5cc-d6917615e851	1550.55	2026-06-05	\N	\N	\N	2026-09-17 17:50:01.899705	2026-09-17 17:50:01.899705	2026-06-05	\N	f	Pix enviado - Cleiber Nichida	PAGO	\N	\N	\N
3e20e993-1edd-40b4-a0b6-c3b3ce796f94	696.00	2026-06-05	\N	\N	\N	2026-09-17 17:50:01.905777	2026-09-17 17:50:01.905777	2026-06-05	\N	f	Pix enviado - Cleiber Nichida	PAGO	\N	\N	\N
c1d56d18-d767-4f4a-acf7-d012245264db	1024.80	2026-06-08	\N	\N	\N	2026-09-17 17:50:01.911872	2026-09-17 17:50:01.911872	2026-06-08	\N	f	Pix enviado - Company Hero Ltda	PAGO	\N	\N	\N
a536e3aa-c24d-4493-8380-0549683cb15e	3700.00	2026-06-09	\N	\N	\N	2026-09-17 17:50:01.917609	2026-09-17 17:50:01.917609	2026-06-09	\N	f	Pix enviado - Cleiber Nichida	PAGO	\N	\N	\N
798781c6-44f8-407d-96f4-816dfee10584	316.78	2026-06-09	\N	\N	\N	2026-09-17 17:50:01.923864	2026-09-17 17:50:01.923864	2026-06-09	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
77f43538-e9b4-480c-8c2b-ac0f2d5edf63	4700.00	2026-06-09	\N	\N	\N	2026-09-17 17:50:01.930311	2026-09-17 17:50:01.930311	2026-06-09	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
fad82c1b-969a-45f4-915b-75521d1ca697	2080.00	2026-06-09	\N	\N	\N	2026-09-17 17:50:01.936336	2026-09-17 17:50:01.936336	2026-06-09	\N	f	Pix enviado - Dectra Tecnologia Ltda	PAGO	\N	\N	\N
b9184736-9d26-4af7-af9a-a8486932f9a7	2078.19	2026-06-09	\N	\N	\N	2026-09-17 17:50:01.943221	2026-09-17 17:50:01.943221	2026-06-09	\N	f	Pagamento de fatura	PAGO	\N	\N	\N
b290fc71-be97-44c2-89bf-29b59d558842	600.00	2026-06-11	\N	\N	\N	2026-09-17 17:50:01.948247	2026-09-17 17:50:01.948247	2026-06-11	\N	f	Pix enviado - Rhuan Messias Silva	PAGO	\N	\N	\N
5eb17eda-ce6d-476d-9c96-3547b515fcba	700.00	2026-06-11	\N	\N	\N	2026-09-17 17:50:01.954851	2026-09-17 17:50:01.954851	2026-06-11	\N	f	Pix enviado - Rafael Batista De Oliveira	PAGO	\N	\N	\N
c91d729b-d08c-439c-84ec-a8f51a666667	20.99	2026-06-15	\N	\N	\N	2026-09-17 17:50:01.960836	2026-09-17 17:50:01.960836	2026-06-15	\N	f	Pix enviado - Pagar Me Pagamentos	PAGO	\N	\N	\N
321f729e-3a6d-4c5d-ae2c-de6a31d35e75	1350.00	2026-06-16	\N	\N	\N	2026-09-17 17:50:01.965906	2026-09-17 17:50:01.965906	2026-06-16	\N	f	Pix enviado - 65166632 Wilgner Tavares De Souza Almeida	PAGO	\N	\N	\N
13125051-46f1-4da7-9b32-586d4bdc502b	400.00	2026-06-22	\N	\N	\N	2026-09-17 17:50:01.973612	2026-09-17 17:50:01.973612	2026-06-22	\N	f	Pix enviado - Kleber Ramos De Morais	PAGO	\N	\N	\N
352f8458-a8fd-4d02-a11f-895f0f7468bc	66.95	2026-06-22	\N	\N	\N	2026-09-17 17:50:01.98062	2026-09-17 17:50:01.98062	2026-06-22	\N	f	Pix enviado - Receita Federal	PAGO	\N	\N	\N
5554496f-c360-4bb6-9e2e-a6c04d479db4	214000.00	2026-06-26	\N	\N	\N	2026-09-17 17:50:01.98684	2026-09-17 17:50:01.98684	2026-06-26	\N	f	Aplicação - Cdb Di Liq Banco Inter Sa	PAGO	\N	\N	\N
37b2ba94-367f-4f52-930d-2dc04c4dd73a	528.38	2026-07-02	\N	\N	\N	2026-09-17 17:50:01.993838	2026-09-17 17:50:01.993838	2026-07-02	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
9921ac6f-bfae-4b2b-831c-f989cfea73d7	459.94	2026-07-02	\N	\N	\N	2026-09-17 17:50:01.999336	2026-09-17 17:50:01.999336	2026-07-02	\N	f	Pix enviado - Cleiber Nichida	PAGO	\N	\N	\N
f868a8ed-b50c-4acb-9fab-91c5386dfee2	4700.00	2026-07-08	\N	\N	\N	2026-09-17 17:50:02.006251	2026-09-17 17:50:02.006251	2026-07-08	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
81edc900-f6f6-4f55-9968-944772b1deae	3700.00	2026-07-08	\N	\N	\N	2026-09-17 17:50:02.012714	2026-09-17 17:50:02.012714	2026-07-08	\N	f	Pix enviado - Cleiber Nichida	PAGO	\N	\N	\N
14415ab6-435a-40db-b626-aad20bf82ada	1400.00	2026-07-08	\N	\N	\N	2026-09-17 17:50:02.017297	2026-09-17 17:50:02.017297	2026-07-08	\N	f	Pix enviado - Rafael Batista De Oliveira	PAGO	\N	\N	\N
44f6c08f-bb29-4c32-b798-9791286827c0	1200.00	2026-07-08	\N	\N	\N	2026-09-17 17:50:02.02401	2026-09-17 17:50:02.02401	2026-07-08	\N	f	Pix enviado - Rhuan Messias Silva	PAGO	\N	\N	\N
38ac0560-a0d3-435c-9e7f-677234aa9809	1862.00	2026-07-08	\N	\N	\N	2026-09-17 17:50:02.030273	2026-09-17 17:50:02.030273	2026-07-08	\N	f	Pix enviado - Dectra Tecnologia Ltda	PAGO	\N	\N	\N
7f174779-6c89-482a-b719-df7ea0865a44	1863.17	2026-07-08	\N	\N	\N	2026-09-17 17:50:02.038458	2026-09-17 17:50:02.038458	2026-07-08	\N	f	Pagamento de fatura	PAGO	\N	\N	\N
4cd5e2f9-b0f8-454a-8024-ba5fc8a5bed0	8.90	2026-07-10	\N	\N	\N	2026-09-17 17:50:02.044934	2026-09-17 17:50:02.044934	2026-07-10	\N	f	Pix enviado - Rf Tecnologia E Intermediacoes	PAGO	\N	\N	\N
a4e1e26f-4b6b-405d-a427-ef23a9679c8d	6895.00	2026-07-15	\N	\N	\N	2026-09-17 17:50:02.050865	2026-09-17 17:50:02.050865	2026-07-15	\N	f	Pagamento efetuado - ARANDA EVENTOS CONGRESSOS LTDA	PAGO	\N	\N	\N
b535f64d-1cd8-45ba-9496-31bc0c0eff15	15.00	2026-07-28	\N	\N	\N	2026-09-17 17:50:02.065126	2026-09-17 17:50:02.065126	2026-07-28	\N	f	Pix enviado - Multidisplay Comercio E Servicos Tecnologicos Ltda	PAGO	\N	\N	\N
53e718d4-c7a5-4da5-94ec-0d06c41bb0c5	400.00	2026-08-04	\N	\N	\N	2026-09-17 17:50:02.072662	2026-09-17 17:50:02.072662	2026-08-04	\N	f	Pix enviado - Kleber Ramos De Morais	PAGO	\N	\N	\N
43e0ebe6-8c8c-4261-ac67-288a885aac94	3700.00	2026-08-10	\N	\N	\N	2026-09-17 17:50:02.078323	2026-09-17 17:50:02.078323	2026-08-10	\N	f	Pix enviado - Cleiber Nichida	PAGO	\N	\N	\N
6347a248-3abb-46c1-baa6-4fef23786ea7	4700.00	2026-08-10	\N	\N	\N	2026-09-17 17:50:02.083327	2026-09-17 17:50:02.083327	2026-08-10	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
bc543c24-1a1b-4763-940d-7c22c845ecf7	5268.00	2026-08-10	\N	\N	\N	2026-09-17 17:50:02.089684	2026-09-17 17:50:02.089684	2026-08-10	\N	f	Pix enviado - Dectra Tecnologia Ltda	PAGO	\N	\N	\N
c3a54def-e02d-47c8-b5a2-fe3edacaddb7	1400.00	2026-08-10	\N	\N	\N	2026-09-17 17:50:02.095428	2026-09-17 17:50:02.095428	2026-08-10	\N	f	Pix enviado - Rafael Batista De Oliveira	PAGO	\N	\N	\N
9d38b896-377a-43a9-85a9-c92b50b28498	1200.00	2026-08-10	\N	\N	\N	2026-09-17 17:50:02.100821	2026-09-17 17:50:02.100821	2026-08-10	\N	f	Pix enviado - Rhuan Messias Silva	PAGO	\N	\N	\N
a09eb01a-d2fb-430f-988d-7090482ef1ba	5267.90	2026-08-10	\N	\N	\N	2026-09-17 17:50:02.107018	2026-09-17 17:50:02.107018	2026-08-10	\N	f	Pagamento de fatura	PAGO	\N	\N	\N
6bfef8fe-3f3b-4fee-b329-d7ea45475691	1350.00	2026-08-15	\N	\N	\N	2026-09-17 17:50:02.113079	2026-09-17 17:50:02.113079	2026-08-15	\N	f	Pix enviado - 65166632 Wilgner Tavares De Souza Almeida	PAGO	\N	\N	\N
e54e3e12-0ae0-4f2f-a47b-844280701c01	775.00	2026-08-17	\N	\N	\N	2026-09-17 17:50:02.1188	2026-09-17 17:50:02.1188	2026-08-17	\N	f	Pix enviado - Oficina De Arte Bureau De Servicos Graficos Ltda	PAGO	\N	\N	\N
e9a7dd61-2775-42d3-b747-6695524bc8c4	133.01	2026-08-19	\N	\N	\N	2026-09-17 17:50:02.126483	2026-09-17 17:50:02.126483	2026-08-19	\N	f	Pix enviado - Receita Federal	PAGO	\N	\N	\N
7448daea-5c22-46d7-81b7-ef2f5131aa6d	555.28	2026-08-19	\N	\N	\N	2026-09-17 17:50:02.131673	2026-09-17 17:50:02.131673	2026-08-19	\N	f	Pix enviado - Receita Federal	PAGO	\N	\N	\N
fa26cd82-56d7-479f-8e6a-1592b198c1e7	473.84	2026-08-19	\N	\N	\N	2026-09-17 17:50:02.139237	2026-09-17 17:50:02.139237	2026-08-19	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
96e83f56-1707-444a-847f-6b54e7e299b3	427.50	2026-08-19	\N	\N	\N	2026-09-17 17:50:02.145326	2026-09-17 17:50:02.145326	2026-08-19	\N	f	Transferência enviada pelo Pix - THIAGO LAUREANO MATOS - •••.078.881-•• - CAIXA ECONOMICA FEDERAL (0104) Agência: 6075 Conta: 3701000000583628147-1	PAGO	\N	\N	\N
6fee0bbf-8198-464d-83c1-d3759e72fa93	160.00	2026-08-20	\N	\N	\N	2026-09-17 17:50:02.150641	2026-09-17 17:50:02.150641	2026-08-20	\N	f	Pix enviado - Oficina De Arte Bureau De Servicos Graficos Ltda	PAGO	\N	\N	\N
105627f9-cf86-4e69-8253-ba591e0c26c2	400.00	2026-08-20	\N	\N	\N	2026-09-17 17:50:02.158354	2026-09-17 17:50:02.158354	2026-08-20	\N	f	Pix enviado - Kleber Ramos De Morais	PAGO	\N	\N	\N
38a96076-d57d-42f3-9325-76bd11f841f4	135.00	2026-08-21	\N	\N	\N	2026-09-17 17:50:02.165405	2026-09-17 17:50:02.165405	2026-08-21	\N	f	Pix enviado - Ponto Rustico Bordados Ltda	PAGO	\N	\N	\N
14dae68e-c44c-4bce-948d-9c0571c89123	1277.00	2026-08-21	\N	\N	\N	2026-09-17 17:50:02.1739	2026-09-17 17:50:02.1739	2026-08-21	\N	f	Pix enviado - Oficina De Arte Bureau De Servicos Graficos Ltda	PAGO	\N	\N	\N
81044ca8-7dd4-4206-b8ed-2c293bc37f4f	331.50	2026-08-25	\N	\N	\N	2026-09-17 17:50:02.180576	2026-09-17 17:50:02.180576	2026-08-25	\N	f	Pix enviado - Hotel Monteneve Ltda	PAGO	\N	\N	\N
f672cc52-483a-4478-92e6-91e2a02e7caa	64.19	2026-09-01	\N	\N	\N	2026-09-17 17:50:02.190041	2026-09-17 17:50:02.190041	2026-09-01	\N	f	Compra no débito - Dl *google Cloud Qsmh2sao Pablo    Bra	PAGO	\N	\N	\N
a4adc0b6-2d41-4d82-8e01-20888567e518	209.70	2026-09-08	\N	\N	\N	2026-09-17 17:50:02.194237	2026-09-17 17:50:02.194237	2026-09-08	\N	f	Pix enviado - Cleiber Nichida	PAGO	\N	\N	\N
53e774df-b0d6-4477-b99c-b74cd6a69733	4700.00	2026-09-08	\N	\N	\N	2026-09-17 17:50:02.198377	2026-09-17 17:50:02.198377	2026-09-08	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
59d238a7-578d-44d5-b231-cac37378c0a8	3700.00	2026-09-08	\N	\N	\N	2026-09-17 17:50:02.205217	2026-09-17 17:50:02.205217	2026-09-08	\N	f	Pix enviado - Cleiber Nichida	PAGO	\N	\N	\N
5f2c359a-756d-47c2-a251-791311a583fb	673.63	2026-09-08	\N	\N	\N	2026-09-17 17:50:02.211775	2026-09-17 17:50:02.211775	2026-09-08	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
dd4322c1-1661-4f70-86e7-59f13fe19b98	1400.00	2026-09-10	\N	\N	\N	2026-09-17 17:50:02.218361	2026-09-17 17:50:02.218361	2026-09-10	\N	f	Pix enviado - Rafael Batista De Oliveira	PAGO	\N	\N	\N
a8984659-6b9e-40eb-b705-b3d2f686522c	1200.00	2026-09-10	\N	\N	\N	2026-09-17 17:50:02.227315	2026-09-17 17:50:02.227315	2026-09-10	\N	f	Pix enviado - Rhuan Messias Silva	PAGO	\N	\N	\N
935088ec-4107-481b-acb6-bccebe46dc80	4239.42	2026-09-10	\N	\N	\N	2026-09-17 17:50:02.232547	2026-09-17 17:50:02.232547	2026-09-10	\N	f	Pix enviado - Nu Pagamentos Sa	PAGO	\N	\N	\N
733950b9-a73e-457b-a394-5512307e6e23	364.14	2026-09-13	\N	\N	\N	2026-09-17 17:50:02.238517	2026-09-17 17:50:02.238517	2026-09-13	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
32e4f9b2-8179-4797-a120-a21249204c7c	596.22	2026-09-13	\N	\N	\N	2026-09-17 17:50:02.243189	2026-09-17 17:50:02.243189	2026-09-13	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
b9e2b20b-dc7c-4510-8ae0-855316179f10	1350.00	2026-07-15	\N	\N	\N	2026-09-17 17:50:02.058833	2026-09-17 18:41:53.399111	2026-07-15	\N	f	Pix enviado - 65166632 Wilgner Tavares De Souza Almeida	PAGO	\N	\N	DESPESA
6fd4f7a2-a1b9-469b-8b70-163b5d828a0f	960.00	2024-06-13	Aluguel	\N	\N	2026-09-17 17:50:00.390636	2026-09-17 19:43:05.987602	2024-06-13	\N	f	Pix enviado: "Cp :15111975-COMPANY HERO LTDA"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
82a9433e-b003-4789-b354-6a3049290d0f	1350.00	2026-09-15	Marketing	\N	\N	2026-09-17 17:50:02.247536	2026-09-17 22:52:14.699877	2026-09-15	\N	f	Pix enviado - 65166632 Wilgner Tavares De Souza Almeida	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
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

COPY public.receivables (id, description, amount, "paidAmount", "dueDate", "paidAt", status, "createdAt", "updatedAt", category, type, "contractId") FROM stdin;
6bba0f23-66a2-436a-a491-d19bad763dd6	Pix recebido: "Cp :60701190-NUCLEO DE GESTAO DO PORTO DIGITAL"	10000.00	0.00	2024-08-08	2024-08-08	RECEBIDO	2026-09-17 17:50:00.423785	2026-09-17 17:50:00.423785	\N	\N	\N
b68271d0-67f9-4f27-a683-a81685a7c633	Pix recebido: "Cp :04388688-SIGMA SOLUCOES EM ENERGIA LTDA"	4116.00	0.00	2024-09-12	2024-09-12	RECEBIDO	2026-09-17 17:50:00.431978	2026-09-17 17:50:00.431978	\N	\N	\N
aee30883-ff7b-4565-8b36-8949a453433b	Pix recebido: "Cp :04388688-SIGMA SOLUCOES EM ENERGIA LTDA"	3446.70	0.00	2025-02-17	2025-02-17	RECEBIDO	2026-09-17 17:50:00.443984	2026-09-17 17:50:00.443984	\N	\N	\N
3c6d68c4-2b12-464a-ae4e-d1a43ad40daa	Pix recebido: "Cp :60701190-SIGMA SOLUCOES EM ENERGIA LTDA"	6232.61	0.00	2025-04-04	2025-04-04	RECEBIDO	2026-09-17 17:50:00.450655	2026-09-17 17:50:00.450655	\N	\N	\N
4fefb9ce-0e42-4b0b-b957-131b8e4255ed	Pix recebido: "Cp :90400888-RICARDO HENRIQUE FONSECA ALVES"	2000.00	0.00	2025-04-07	2025-04-07	RECEBIDO	2026-09-17 17:50:00.463513	2026-09-17 17:50:00.463513	\N	\N	\N
b722e3c5-6e78-4193-b736-43d2d4b5d703	Transferencia recebida: "237 3684 34193 BC GERACAO E GESTAO DE ATIVOS DE EN"	29955.88	0.00	2025-04-14	2025-04-14	RECEBIDO	2026-09-17 17:50:00.47476	2026-09-17 17:50:00.47476	\N	\N	\N
ee3df71c-4d56-4468-8a14-ace1399e6feb	Transferencia recebida: "237 3684 34193 BC GERACAO E GESTAO DE ATIVOS DE EN"	7858.76	0.00	2025-04-14	2025-04-14	RECEBIDO	2026-09-17 17:50:00.484452	2026-09-17 17:50:00.484452	\N	\N	\N
fa2f4dc3-0125-4943-b742-f7fbc12deae2	Pix recebido: "Cp :60701190-SIGMA SOLUCOES EM ENERGIA LTDA"	16688.90	0.00	2025-04-17	2025-04-17	RECEBIDO	2026-09-17 17:50:00.498775	2026-09-17 17:50:00.498775	\N	\N	\N
fe31aa9f-861b-437a-a284-5786e53bba20	Pix recebido: "Cp :60701190-SIGMA SOLUCOES EM ENERGIA LTDA"	3271.40	0.00	2025-04-17	2025-04-17	RECEBIDO	2026-09-17 17:50:00.51304	2026-09-17 17:50:00.51304	\N	\N	\N
282c38e8-dcd7-41ad-893c-8697334df1d8	Pix recebido: "00019 7469330 RICARDO ALVES"	1000.00	0.00	2025-05-08	2025-05-08	RECEBIDO	2026-09-17 17:50:00.52433	2026-09-17 17:50:00.52433	\N	\N	\N
be559092-577b-487b-b09e-45cbed2eeea0	Pix recebido: "Cp :00000000-RICARDO HENRIQUE FONSECA ALVES"	1000.00	0.00	2025-05-08	2025-05-08	RECEBIDO	2026-09-17 17:50:00.535587	2026-09-17 17:50:00.535587	\N	\N	\N
37d76650-d1d8-4c12-9168-5cc5db5b13a6	Pix recebido: "Cp :18236120-Carlos Eduardo Rocha Sousa"	0.13	0.00	2025-05-21	2025-05-21	RECEBIDO	2026-09-17 17:50:00.550324	2026-09-17 17:50:00.550324	\N	\N	\N
f7c62077-aba3-4ad8-b4cc-47827bf474ac	Transferencia recebida: "237 3684 34193 BC GERACAO E GESTAO DE ATIVOS DE EN"	14073.33	0.00	2025-07-03	2025-07-03	RECEBIDO	2026-09-17 17:50:00.563389	2026-09-17 17:50:00.563389	\N	\N	\N
08d76a3c-3c79-435c-9d3b-24bfcee45016	Transferencia recebida: "237 3684 34193 BC GERACAO E GESTAO DE ATIVOS DE EN"	1686.35	0.00	2025-07-03	2025-07-03	RECEBIDO	2026-09-17 17:50:00.577237	2026-09-17 17:50:00.577237	\N	\N	\N
58be5143-f8d9-4666-bb9a-45a5f7022741	Transferencia recebida: "237 3684 34193 BC GERACAO E GESTAO DE ATIVOS DE EN"	25423.63	0.00	2025-07-03	2025-07-03	RECEBIDO	2026-09-17 17:50:00.590773	2026-09-17 17:50:00.590773	\N	\N	\N
32691c03-0aa2-4a0e-8acc-e7f67c2b55d7	Transferencia recebida: "237 3684 34193 BC GERACAO E GESTAO DE ATIVOS DE EN"	8427.10	0.00	2025-07-03	2025-07-03	RECEBIDO	2026-09-17 17:50:00.605923	2026-09-17 17:50:00.605923	\N	\N	\N
6b3d4e6a-db54-45a5-b12c-91953741ce04	Transferencia recebida: "237 3684 34193 BC GERACAO E GESTAO DE ATIVOS DE EN"	7046.75	0.00	2025-07-03	2025-07-03	RECEBIDO	2026-09-17 17:50:00.621385	2026-09-17 17:50:00.621385	\N	\N	\N
e5572d22-9166-4d71-a721-29d94a2d882b	Transferencia recebida: "237 3684 34193 BC GERACAO E GESTAO DE ATIVOS DE EN"	5295.24	0.00	2025-07-03	2025-07-03	RECEBIDO	2026-09-17 17:50:00.631278	2026-09-17 17:50:00.631278	\N	\N	\N
8818c31a-4574-4b1d-a52b-687a20091d6b	Transferencia recebida: "237 3684 34193 BC GERACAO E GESTAO DE ATIVOS DE EN"	13785.00	0.00	2025-07-03	2025-07-03	RECEBIDO	2026-09-17 17:50:00.64432	2026-09-17 17:50:00.64432	\N	\N	\N
78bf031d-34e1-435a-80eb-d1dd8b41ed80	Transferencia recebida: "237 3684 34193 BC GERACAO E GESTAO DE ATIVOS DE EN"	3710.35	0.00	2025-07-03	2025-07-03	RECEBIDO	2026-09-17 17:50:00.657055	2026-09-17 17:50:00.657055	\N	\N	\N
b5ed88de-aa46-4385-9c23-743a105cbc49	Boleto de cobranca recebido: "112/90368510437"	1282.16	0.00	2025-07-25	2025-07-25	RECEBIDO	2026-09-17 17:50:00.666117	2026-09-17 17:50:00.666117	\N	\N	\N
59fccc3e-935a-46a6-aed4-09876e6f140a	Boleto de cobranca recebido: "112/90369973006"	2325.87	0.00	2025-07-25	2025-07-25	RECEBIDO	2026-09-17 17:50:00.679646	2026-09-17 17:50:00.679646	\N	\N	\N
067941f3-8fef-40f5-b62e-79b56479af01	Boleto de cobranca recebido: "112/90368510452"	1282.16	0.00	2025-08-25	2025-08-25	RECEBIDO	2026-09-17 17:50:00.691706	2026-09-17 17:50:00.691706	\N	\N	\N
57d016cf-07df-42a4-856c-b2403b32b89e	Boleto de cobranca recebido: "112/90369973014"	2325.87	0.00	2025-08-25	2025-08-25	RECEBIDO	2026-09-17 17:50:00.705154	2026-09-17 17:50:00.705154	\N	\N	\N
0bfb90f6-7656-4c51-a547-deb4319eb400	Boleto de cobranca recebido: "112/90429405486"	450.00	0.00	2025-09-10	2025-09-10	RECEBIDO	2026-09-17 17:50:00.714961	2026-09-17 17:50:00.714961	\N	\N	\N
1b6e397f-3997-4ecf-bd6d-7a5115b88546	Boleto de cobranca recebido: "112/90368510460"	1282.16	0.00	2025-09-25	2025-09-25	RECEBIDO	2026-09-17 17:50:00.723682	2026-09-17 17:50:00.723682	\N	\N	\N
c72771eb-b913-43e7-b3d2-a4922b7131d0	Boleto de cobranca recebido: "112/90369973022"	2325.86	0.00	2025-09-25	2025-09-25	RECEBIDO	2026-09-17 17:50:00.733189	2026-09-17 17:50:00.733189	\N	\N	\N
6c722c1b-2815-4cb5-b22a-d5edccae273d	Boleto de cobranca recebido: "112/90414567548"	1250.00	0.00	2025-09-29	2025-09-29	RECEBIDO	2026-09-17 17:50:00.74396	2026-09-17 17:50:00.74396	\N	\N	\N
0db2aff6-b310-43d8-a208-29a7a049b656	Boleto de cobranca recebido: "112/90496751747"	11430.45	0.00	2025-12-01	2025-12-01	RECEBIDO	2026-09-17 17:50:00.752685	2026-09-17 17:50:00.752685	\N	\N	\N
5e2376e0-46a2-4fca-b68b-f530576d9996	Boleto de cobranca recebido: "112/90496759476"	11430.45	0.00	2025-12-22	2025-12-22	RECEBIDO	2026-09-17 17:50:00.760443	2026-09-17 17:50:00.760443	\N	\N	\N
b43617df-e11e-45b1-a6f8-3c0d3240ba20	Resgate - Cdb Di Liq Banco Inter S A	3500.00	0.00	2026-01-02	2026-01-02	RECEBIDO	2026-09-17 17:50:00.772713	2026-09-17 17:50:00.772713	\N	\N	\N
c332e425-dfb7-49eb-893d-da84a7f8ec8c	Resgate - Cdb Di Liq Banco Inter S A	877.20	0.00	2026-01-05	2026-01-05	RECEBIDO	2026-09-17 17:50:00.784526	2026-09-17 17:50:00.784526	\N	\N	\N
2799d3a9-6bdd-4a7c-81ec-6b44d16ba5ed	Resgate - Cdb Di Liq Banco Inter S A	28.19	0.00	2026-01-05	2026-01-05	RECEBIDO	2026-09-17 17:50:00.799014	2026-09-17 17:50:00.799014	\N	\N	\N
b1318fb5-8c17-4f00-8dbe-ef932480b173	Transferência recebida pelo Pix - DECTRA INOVA SIMPLES - 53.450.778/0001-69 - BANCO INTER (0077) Agência: 1 Conta: 36270276-4	28.19	0.00	2026-01-05	2026-01-05	RECEBIDO	2026-09-17 17:50:00.810588	2026-09-17 17:50:00.810588	\N	\N	\N
a9d50e67-a4e3-4fbc-8221-02e25562282b	Resgate - Cdb Credito Banco Inter S A	210.71	0.00	2026-01-06	2026-01-06	RECEBIDO	2026-09-17 17:50:00.822675	2026-09-17 17:50:00.822675	\N	\N	\N
f5fcb8ea-5266-4b18-b722-49f6bf8a28e0	Resgate - Cdb Credito Banco Inter S A	3286.78	0.00	2026-01-06	2026-01-06	RECEBIDO	2026-09-17 17:50:00.836736	2026-09-17 17:50:00.836736	\N	\N	\N
e5a882e5-3b83-4400-8cae-abd6ead36542	Resgate - Cdb Di Liq Banco Inter S A	2500.00	0.00	2026-01-08	2026-01-08	RECEBIDO	2026-09-17 17:50:00.849359	2026-09-17 17:50:00.849359	\N	\N	\N
5680bb8d-267d-4316-a6ed-14f133e84a41	Boleto de cobranca recebido: "112/90564546078"	11430.45	0.00	2026-01-12	2026-01-12	RECEBIDO	2026-09-17 17:50:00.863712	2026-09-17 17:50:00.863712	\N	\N	\N
0ef9acc4-4657-4e27-916d-0c98a7a8220e	Boleto de cobrança recebido - Gali LTDA	11430.45	0.00	2026-01-12	2026-01-12	RECEBIDO	2026-09-17 17:50:00.87609	2026-09-17 17:50:00.87609	\N	\N	\N
21056857-211b-446d-a754-7cda74e02f42	Resgate - Cdb Di Liq Banco Inter S A	2300.00	0.00	2026-01-13	2026-01-13	RECEBIDO	2026-09-17 17:50:00.889038	2026-09-17 17:50:00.889038	\N	\N	\N
e832461e-562f-4c0c-93b5-085f9284a93e	Resgate - Cdb Di Liq Banco Inter S A	130.16	0.00	2026-01-14	2026-01-14	RECEBIDO	2026-09-17 17:50:00.90092	2026-09-17 17:50:00.90092	\N	\N	\N
8b9678b9-a733-4a89-bfff-65b87aae89c9	Resgate - Cdb Di Liq Banco Inter S A	102.55	0.00	2026-01-24	2026-01-24	RECEBIDO	2026-09-17 17:50:00.914277	2026-09-17 17:50:00.914277	\N	\N	\N
6d19c736-3aa0-4174-b85a-e5e7b3e21bf2	Resgate - Cdb Di Liq Banco Inter Sa	3500.00	0.00	2026-02-06	2026-02-06	RECEBIDO	2026-09-17 17:50:00.928816	2026-09-17 17:50:00.928816	\N	\N	\N
86d22461-912e-4a72-8aea-0917d525bae7	Resgate - Cdb Di Liq Banco Inter Sa	45.08	0.00	2026-02-08	2026-02-08	RECEBIDO	2026-09-17 17:50:00.941607	2026-09-17 17:50:00.941607	\N	\N	\N
f3bd12cd-27fd-48cf-9926-a535df1bf7bd	Resgate - Cdb Di Liq Banco Inter Sa	3700.00	0.00	2026-02-11	2026-02-11	RECEBIDO	2026-09-17 17:50:00.951067	2026-09-17 17:50:00.951067	\N	\N	\N
7a823e74-6b83-443b-99fb-9d732231cab0	Resgate - Cdb Di Liq Banco Inter Sa	1200.00	0.00	2026-02-12	2026-02-12	RECEBIDO	2026-09-17 17:50:00.968707	2026-09-17 17:50:00.968707	\N	\N	\N
08e59d39-73e5-494d-8fba-97140d6aa033	Resgate - Cdb Di Liq Banco Inter Sa	278.64	0.00	2026-02-12	2026-02-12	RECEBIDO	2026-09-17 17:50:00.982552	2026-09-17 17:50:00.982552	\N	\N	\N
6d9755d5-eb88-4aeb-8fcb-38baefd8d0c6	Transferência recebida pelo Pix - DECTRA INOVA SIMPLES - 53.450.778/0001-69 - BANCO INTER (0077) Agência: 1 Conta: 36270276-4	278.64	0.00	2026-02-12	2026-02-12	RECEBIDO	2026-09-17 17:50:00.996901	2026-09-17 17:50:00.996901	\N	\N	\N
29033c1d-3614-4733-b0f8-48ca714e9d80	Resgate - Cdb Di Liq Banco Inter Sa	800.00	0.00	2026-02-25	2026-02-25	RECEBIDO	2026-09-17 17:50:01.009919	2026-09-17 17:50:01.009919	\N	\N	\N
876e5739-460f-49d1-b24e-1cb6927338e8	Resgate - Cdb Di Liq Banco Inter Sa	9000.00	0.00	2026-03-07	2026-03-07	RECEBIDO	2026-09-17 17:50:01.02226	2026-09-17 17:50:01.02226	\N	\N	\N
b31175c5-d971-4aba-a46b-af8ae200d5a8	Resgate - Cdb Di Liq Banco Inter Sa	70.28	0.00	2026-03-10	2026-03-10	RECEBIDO	2026-09-17 17:50:01.032302	2026-09-17 17:50:01.032302	\N	\N	\N
22437412-53d5-401e-8698-f3a3ec5d3ca9	Resgate - Cdb Di Liq Banco Inter S A	9000.00	0.00	2026-09-08	2026-09-08	RECEBIDO	2026-09-17 17:50:01.78126	2026-09-17 17:50:01.78126	\N	\N	\N
a86062c1-7621-47ca-97a2-08b55b8ac582	Pix recebido: "Cp :00000000-CARLOS R SILVEIRA JR"	320.00	0.00	2024-06-13	2024-06-13	RECEBIDO	2026-09-17 17:50:00.397892	2026-09-17 19:41:41.649901	Outros	RECEITA_EXTRAORDINARIA	\N
a309153e-6024-4f08-9a43-9f66f0dc1b1f	Transferência recebida pelo Pix - DECTRA INOVA SIMPLES - 53.450.778/0001-69 - BANCO INTER (0077) Agência: 1 Conta: 36270276-4	153.80	0.00	2026-03-10	2026-03-10	RECEBIDO	2026-09-17 17:50:01.047181	2026-09-17 17:50:01.047181	\N	\N	\N
c5464040-8462-4e29-80f7-9b6bcd407400	Pix recebido - Nucleo De Gestao Do Porto Digital	100000.00	0.00	2026-03-26	2026-03-26	RECEBIDO	2026-09-17 17:50:01.061746	2026-09-17 17:50:01.061746	\N	\N	\N
5c9e6e81-c497-48f4-b7ce-d8d3dedc6f05	Crédito domicílio cartão - Cartão De Crédito - Stripe	1.50	0.00	2026-03-30	2026-03-30	RECEBIDO	2026-09-17 17:50:01.078243	2026-09-17 17:50:01.078243	\N	\N	\N
15dc0f89-f3f1-4492-9e08-1b7d7841c217	Resgate - Cdb Di Liq Banco Inter Sa	44.00	0.00	2026-04-02	2026-04-02	RECEBIDO	2026-09-17 17:50:01.093716	2026-09-17 17:50:01.093716	\N	\N	\N
9187228b-cc55-4afe-8f75-89f8850971c7	Resgate - Cdb Di Liq Banco Inter Sa	5000.00	0.00	2026-04-06	2026-04-06	RECEBIDO	2026-09-17 17:50:01.106929	2026-09-17 17:50:01.106929	\N	\N	\N
18c6bf8f-378e-4314-9f5c-4080ec300fc1	Resgate - Cdb Di Liq Banco Inter Sa	285.00	0.00	2026-04-08	2026-04-08	RECEBIDO	2026-09-17 17:50:01.122578	2026-09-17 17:50:01.122578	\N	\N	\N
ff92290a-422c-4779-8d65-cfec7b09d566	Transferência recebida pelo Pix - DECTRA INOVA SIMPLES - 53.450.778/0001-69 - BANCO INTER (0077) Agência: 1 Conta: 36270276-4	585.42	0.00	2026-04-08	2026-04-08	RECEBIDO	2026-09-17 17:50:01.134137	2026-09-17 17:50:01.134137	\N	\N	\N
fedb8543-e984-444b-9605-752bc59b8bc4	Resgate - Cdb Di Liq Banco Inter Sa	3700.00	0.00	2026-04-10	2026-04-10	RECEBIDO	2026-09-17 17:50:01.149719	2026-09-17 17:50:01.149719	\N	\N	\N
6fd1b3a0-8887-4f6c-8b28-8b1236f4a033	Resgate - Cdb Di Liq Banco Inter Sa	1350.00	0.00	2026-04-15	2026-04-15	RECEBIDO	2026-09-17 17:50:01.16351	2026-09-17 17:50:01.16351	\N	\N	\N
054ce664-844c-4019-818b-157403cdc23b	Resgate - Cdb Di Liq Banco Inter Sa	800.00	0.00	2026-04-18	2026-04-18	RECEBIDO	2026-09-17 17:50:01.17827	2026-09-17 17:50:01.17827	\N	\N	\N
ab00ac9e-5395-43a4-baa1-7fe76f299256	Resgate - Cdb Di Liq Banco Inter Sa	7578.44	0.00	2026-05-08	2026-05-08	RECEBIDO	2026-09-17 17:50:01.193185	2026-09-17 17:50:01.193185	\N	\N	\N
1ccf7a48-d308-4c3e-9925-747af123b2ef	Resgate - Cdb Di Liq Banco Inter Sa	2421.56	0.00	2026-05-08	2026-05-08	RECEBIDO	2026-09-17 17:50:01.20587	2026-09-17 17:50:01.20587	\N	\N	\N
0ad3a239-efaf-4281-84b7-f36a5ab88989	Boleto de cobrança recebido - Voltax Energia e Comércio LTDA	1200.00	0.00	2026-05-13	2026-05-13	RECEBIDO	2026-09-17 17:50:01.220607	2026-09-17 17:50:01.220607	\N	\N	\N
01fa0b1f-49e9-442a-921f-4cef39f1c2cf	Resgate - Cdb Di Liq Banco Inter Sa	1659.32	0.00	2026-05-22	2026-05-22	RECEBIDO	2026-09-17 17:50:01.230686	2026-09-17 17:50:01.230686	\N	\N	\N
fbe1c5ec-d83f-4c4b-ba21-392a0c17f01b	Resgate - Cdb Di Liq Banco Inter Sa	340.68	0.00	2026-05-22	2026-05-22	RECEBIDO	2026-09-17 17:50:01.243171	2026-09-17 17:50:01.243171	\N	\N	\N
2663b8ca-a2da-4394-a08c-479ddb2b6519	Resgate - Cdb Di Liq Banco Inter Sa	2000.00	0.00	2026-05-29	2026-05-29	RECEBIDO	2026-09-17 17:50:01.255503	2026-09-17 17:50:01.255503	\N	\N	\N
9b8ea6f5-ed56-429e-8446-b4ff64e8e963	Boleto de cobrança recebido - NORR ENGENHARIA E ENERGIA LTDA	1080.00	0.00	2026-05-29	2026-05-29	RECEBIDO	2026-09-17 17:50:01.265467	2026-09-17 17:50:01.265467	\N	\N	\N
6043634f-c9e2-4337-913a-a42456d6f6f8	Resgate - Cdb Di Liq Banco Inter Sa	1446.52	0.00	2026-06-05	2026-06-05	RECEBIDO	2026-09-17 17:50:01.280852	2026-09-17 17:50:01.280852	\N	\N	\N
320cc30b-b5e4-41e7-9e78-fcf0557fa404	Resgate - Cdb Di Liq Banco Inter Sa	553.48	0.00	2026-06-05	2026-06-05	RECEBIDO	2026-09-17 17:50:01.295416	2026-09-17 17:50:01.295416	\N	\N	\N
0c452570-e30b-4611-a9b1-dc33618fe95d	Resgate - Cdb Di Liq Banco Inter Sa	1000.00	0.00	2026-06-08	2026-06-08	RECEBIDO	2026-09-17 17:50:01.306003	2026-09-17 17:50:01.306003	\N	\N	\N
6fa44d8f-ea9e-4263-bfe8-5cd42986172d	Resgate - Cdb Di Liq Banco Inter Sa	10000.00	0.00	2026-06-09	2026-06-09	RECEBIDO	2026-09-17 17:50:01.317524	2026-09-17 17:50:01.317524	\N	\N	\N
d219cad3-f5a7-446e-b255-0c02d576199d	Pix recebido - Norr Engenharia E Energia Ltda	1116.00	0.00	2026-06-09	2026-06-09	RECEBIDO	2026-09-17 17:50:01.330752	2026-09-17 17:50:01.330752	\N	\N	\N
eaa91a38-c49b-478c-8ad2-15e8a3a3f8cb	Transferência recebida pelo Pix - DECTRA INOVA SIMPLES - 53.450.778/0001-69 - BANCO INTER (0077) Agência: 1 Conta: 36270276-4	2080.00	0.00	2026-06-09	2026-06-09	RECEBIDO	2026-09-17 17:50:01.343546	2026-09-17 17:50:01.343546	\N	\N	\N
452ef855-ff4b-425e-ae37-1cf24da12b49	Resgate - Cdb Di Liq Banco Inter Sa	532.74	0.00	2026-06-11	2026-06-11	RECEBIDO	2026-09-17 17:50:01.357351	2026-09-17 17:50:01.357351	\N	\N	\N
124dc42b-75c4-4ab4-9d92-0c305f02b059	Resgate - Cdb Di Liq Banco Inter Sa	467.26	0.00	2026-06-11	2026-06-11	RECEBIDO	2026-09-17 17:50:01.371822	2026-09-17 17:50:01.371822	\N	\N	\N
5fdac41f-9756-4819-beb7-7214ffd0b5ff	Resgate - Cdb Di Liq Banco Inter Sa	1350.00	0.00	2026-06-16	2026-06-16	RECEBIDO	2026-09-17 17:50:01.38046	2026-09-17 17:50:01.38046	\N	\N	\N
b616fa59-6490-4084-b6c7-eb3c22130a21	Resgate - Cdb Di Liq Banco Inter Sa	500.00	0.00	2026-06-22	2026-06-22	RECEBIDO	2026-09-17 17:50:01.392542	2026-09-17 17:50:01.392542	\N	\N	\N
eeb0f07c-dd3a-41b8-aaa4-2576d8a6f549	Pix recebido - Nucleo De Gestao Do Porto Digi	100000.00	0.00	2026-06-26	2026-06-26	RECEBIDO	2026-09-17 17:50:01.405404	2026-09-17 17:50:01.405404	\N	\N	\N
03f3eedd-0c7a-4d33-b0fe-73060d099661	Boleto de cobrança recebido - NORR ENGENHARIA E ENERGIA LTDA	6587.60	0.00	2026-06-26	2026-06-26	RECEBIDO	2026-09-17 17:50:01.41702	2026-09-17 17:50:01.41702	\N	\N	\N
d926587b-9c77-495e-978b-a1cf84b29dc4	Boleto de cobrança recebido - NORR ENGENHARIA E ENERGIA LTDA	1292.00	0.00	2026-06-26	2026-06-26	RECEBIDO	2026-09-17 17:50:01.430223	2026-09-17 17:50:01.430223	\N	\N	\N
6c06a792-d06f-4590-b3e1-0559f7e0a63f	Resgate - Cdb Di Liq Banco Inter Sa	3675.24	0.00	2026-06-26	2026-06-26	RECEBIDO	2026-09-17 17:50:01.443017	2026-09-17 17:50:01.443017	\N	\N	\N
b18d5c42-bde6-4d32-99df-2ebb9e89c124	Resgate - Cdb Di Liq Banco Inter Sa	9750.76	0.00	2026-06-26	2026-06-26	RECEBIDO	2026-09-17 17:50:01.456091	2026-09-17 17:50:01.456091	\N	\N	\N
f4f548e2-eba4-4579-bfd1-1ef7283d7877	Resgate - Cdb Di Liq Banco Inter Sa	11985.39	0.00	2026-06-26	2026-06-26	RECEBIDO	2026-09-17 17:50:01.477482	2026-09-17 17:50:01.477482	\N	\N	\N
c24057c6-050d-4fab-9438-0719afebb6b8	Resgate - Cdb Di Liq Banco Inter Sa	81588.61	0.00	2026-06-26	2026-06-26	RECEBIDO	2026-09-17 17:50:01.501171	2026-09-17 17:50:01.501171	\N	\N	\N
3938b4b7-94c3-4b3b-a389-d35fb91cea95	Boleto de cobrança recebido - NORR ENGENHARIA E ENERGIA LTDA	440.80	0.00	2026-06-30	2026-06-30	RECEBIDO	2026-09-17 17:50:01.515682	2026-09-17 17:50:01.515682	\N	\N	\N
ad4abdb5-dc22-4b7c-be36-9a7a7556163d	Resgate - Cdb Di Liq Banco Inter S A	10000.00	0.00	2026-07-08	2026-07-08	RECEBIDO	2026-09-17 17:50:01.529245	2026-09-17 17:50:01.529245	\N	\N	\N
ffa67495-594c-4e06-b4f1-d09d920b9ef7	Resgate - Cdb Di Liq Banco Inter S A	1000.00	0.00	2026-07-08	2026-07-08	RECEBIDO	2026-09-17 17:50:01.541619	2026-09-17 17:50:01.541619	\N	\N	\N
2c83f695-7959-4833-a980-5d60902a0b15	Resgate - Cdb Di Liq Banco Inter S A	1500.00	0.00	2026-07-08	2026-07-08	RECEBIDO	2026-09-17 17:50:01.550485	2026-09-17 17:50:01.550485	\N	\N	\N
11a7b011-35a2-46c4-91d9-56aa9edd9c81	Transferência recebida pelo Pix - DECTRA INOVA SIMPLES - 53.450.778/0001-69 - BANCO INTER (0077) Agência: 1 Conta: 36270276-4	1862.00	0.00	2026-07-08	2026-07-08	RECEBIDO	2026-09-17 17:50:01.564023	2026-09-17 17:50:01.564023	\N	\N	\N
22c791ca-b36b-4c80-94b1-a8ed5cc37e77	Resgate - Cdb Di Liq Banco Inter S A	1000.00	0.00	2026-07-10	2026-07-10	RECEBIDO	2026-09-17 17:50:01.576304	2026-09-17 17:50:01.576304	\N	\N	\N
ecf56b9e-eeff-4a11-ac0e-2168f77fd618	Transferência recebida - Voltax Engenharia Industria E	1781.46	0.00	2026-07-13	2026-07-13	RECEBIDO	2026-09-17 17:50:01.58874	2026-09-17 17:50:01.58874	\N	\N	\N
88317988-5bf6-45c6-ac51-c8a49fe8535b	Resgate - Cdb Di Liq Banco Inter S A	5000.00	0.00	2026-07-15	2026-07-15	RECEBIDO	2026-09-17 17:50:01.599632	2026-09-17 17:50:01.599632	\N	\N	\N
53b39e65-441a-491a-b3b7-19225a178205	Boleto de cobrança recebido - POLIFERTIL UFV MATO GROSSO DO SUL 1 EQUIPAMENTOS FOTOVOLTAICOS LTDA	1008.00	0.00	2026-07-30	2026-07-30	RECEBIDO	2026-09-17 17:50:01.620847	2026-09-17 17:50:01.620847	\N	\N	\N
0e258407-37c9-4fe8-a8a3-d54f7694cfa1	Resgate - Cdb Di Liq Banco Inter S A	16370.80	0.00	2026-08-10	2026-08-10	RECEBIDO	2026-09-17 17:50:01.631609	2026-09-17 17:50:01.631609	\N	\N	\N
44697c4f-20a5-4022-8973-5345117ae2ea	Resgate - Cdb Di Liq Banco Inter S A	1629.20	0.00	2026-08-10	2026-08-10	RECEBIDO	2026-09-17 17:50:01.644434	2026-09-17 17:50:01.644434	\N	\N	\N
901868ca-a935-4017-93db-882e96ab19c3	Transferência recebida pelo Pix - DECTRA INOVA SIMPLES - 53.450.778/0001-69 - BANCO INTER (0077) Agência: 1 Conta: 36270276-4	5268.00	0.00	2026-08-10	2026-08-10	RECEBIDO	2026-09-17 17:50:01.657073	2026-09-17 17:50:01.657073	\N	\N	\N
e3f8e6d7-3964-43f4-884d-7e8cc27242f8	Crédito domicílio cartão - Cartão De Crédito - Stripe	24.00	0.00	2026-08-12	2026-08-12	RECEBIDO	2026-09-17 17:50:01.667964	2026-09-17 17:50:01.667964	\N	\N	\N
d089267b-df02-4c4c-ad95-a8b51b1b3fd4	Crédito domicílio cartão - Cartão De Crédito - Stripe	75.00	0.00	2026-08-17	2026-08-17	RECEBIDO	2026-09-17 17:50:01.680836	2026-09-17 17:50:01.680836	\N	\N	\N
acd81127-209a-4574-af59-473533c6144b	Pix recebido - Jorge Augusto Lobo Caldeira	500.00	0.00	2026-08-17	2026-08-17	RECEBIDO	2026-09-17 17:50:01.693441	2026-09-17 17:50:01.693441	\N	\N	\N
0a64ef16-3a53-48af-816a-380a91be602e	Valor adicionado na conta por cartão de crédito - Valor adicionado para Pix no Crédito	427.50	0.00	2026-08-19	2026-08-19	RECEBIDO	2026-09-17 17:50:01.706726	2026-09-17 17:50:01.706726	\N	\N	\N
b0673eb4-a58e-4918-a450-47742ce50de1	Pix recebido - Enertek Solucoes	1890.00	0.00	2026-08-20	2026-08-20	RECEBIDO	2026-09-17 17:50:01.718902	2026-09-17 17:50:01.718902	\N	\N	\N
0b300e4c-685d-4e2f-b538-5f9dd14adf38	Crédito domicílio cartão - Cartão De Crédito - Stripe	27.00	0.00	2026-08-31	2026-08-31	RECEBIDO	2026-09-17 17:50:01.743703	2026-09-17 17:50:01.743703	\N	\N	\N
31f97d6a-2da1-432c-a26a-0446a505dad7	Resgate - Cdb Di Liq Banco Inter S A	800.00	0.00	2026-09-03	2026-09-03	RECEBIDO	2026-09-17 17:50:01.755965	2026-09-17 17:50:01.755965	\N	\N	\N
0dd5d090-86da-403e-acbf-797e266b791b	Crédito domicílio cartão - Cartão De Crédito - Stripe	1.25	0.00	2026-09-04	2026-09-04	RECEBIDO	2026-09-17 17:50:01.767134	2026-09-17 17:50:01.767134	\N	\N	\N
896cdd91-85ba-4471-8244-ae64580a3e26	Resgate - Cdb Di Liq Banco Inter S A	1000.00	0.00	2026-08-25	2026-08-25	RECEBIDO	2026-09-17 17:50:01.731436	2026-09-17 22:51:38.016506	Outros	RECEITA_EXTRAORDINARIA	\N
a543525a-692e-4443-a86e-5512d54a6d55	Resgate - Cdb Di Liq Banco Inter S A	2000.00	0.00	2026-09-10	2026-09-10	RECEBIDO	2026-09-17 17:50:01.795426	2026-09-17 17:50:01.795426	\N	\N	\N
828044ea-e6a8-4542-a67f-1cc3f3f8a099	Resgate - Cdb Di Liq Banco Inter S A	5000.00	0.00	2026-09-10	2026-09-10	RECEBIDO	2026-09-17 17:50:01.807351	2026-09-17 17:50:01.807351	\N	\N	\N
ece7ad4a-3f5b-49b2-b61e-aa0db28c30c6	Resgate - Cdb Di Liq Banco Inter S A	1300.00	0.00	2026-09-15	2026-09-15	RECEBIDO	2026-09-17 17:50:01.818292	2026-09-17 17:50:01.818292	\N	\N	\N
22b99dc6-71d0-4db1-b489-14f1c74395e0	Pix recebido: "Cp :18236120-Carlos Eduardo Rocha Sousa"	320.00	0.00	2024-06-13	2024-06-13	RECEBIDO	2026-09-17 17:50:00.370806	2026-09-17 19:41:16.652933	Outros	RECEITA_EXTRAORDINARIA	\N
e24f8ab0-6ce0-4206-824b-1c0d8a9abb52	Pix recebido: "00019 0007469330 RICARDO ALVES"	320.00	0.00	2024-06-13	2024-06-13	RECEBIDO	2026-09-17 17:50:00.411954	2026-09-17 19:41:57.543209	Outros	RECEITA_EXTRAORDINARIA	\N
86682992-f7ce-487d-95c5-6287c9b7e089	Resgate - Cdb Di Liq Banco Inter S A	1000.00	0.00	2026-07-15	2026-07-15	RECEBIDO	2026-09-17 17:50:01.610203	2026-09-17 22:50:42.247759	Outros	RECEITA_EXTRAORDINARIA	\N
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
-- Name: financial_categories PK_cd806eb06bb34758203c506ff15; Type: CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.financial_categories
    ADD CONSTRAINT "PK_cd806eb06bb34758203c506ff15" PRIMARY KEY (id);


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
-- Name: receivables FK_1c23bb6996d35889683eeb61eab; Type: FK CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.receivables
    ADD CONSTRAINT "FK_1c23bb6996d35889683eeb61eab" FOREIGN KEY ("contractId") REFERENCES public.contracts(id);


--
-- Name: payables FK_1ef6e318d6258763acd725665de; Type: FK CONSTRAINT; Schema: public; Owner: dectra
--

ALTER TABLE ONLY public.payables
    ADD CONSTRAINT "FK_1ef6e318d6258763acd725665de" FOREIGN KEY ("contractId") REFERENCES public.contracts(id);


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

\unrestrict WVaJvaE4yaxcrtVA7OSWXlI8xmmHBoybq5aGBCNw3Pn2ustz1pudN5UT25eQdUv

