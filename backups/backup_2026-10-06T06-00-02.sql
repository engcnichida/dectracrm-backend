--
-- PostgreSQL database dump
--

\restrict mAq7H8wb70bFikVp7JQsXRGhr1FYcPKQjLyS1CccN12eiy0iuCvCw8lFl9p3dW3

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
f3370349-b586-4371-bf84-6c278227deb4	backup_2026-09-17T06-00-00.sql	D:\\dectracrm-cloud\\backend\\backups\\backup_2026-09-17T06-00-00.sql	58356	automatic	SUCCESS	\N	564	system	2026-09-17 06:00:00.676535
4e2b0259-a246-470c-ae91-794b5d346f0c	backup_2026-09-18T06-00-00.sql	D:\\dectracrm-cloud\\backend\\backups\\backup_2026-09-18T06-00-00.sql	103343	automatic	SUCCESS	\N	888	system	2026-09-18 06:00:00.35892
82317759-cbd0-463b-9759-6262c03729dd	backup_2026-09-19T06-00-00.sql	D:\\dectracrm-cloud\\backend\\backups\\backup_2026-09-19T06-00-00.sql	92164	automatic	SUCCESS	\N	932	system	2026-09-19 06:00:00.854319
b97ba3ba-ebdb-4463-bdee-e73b0d2670eb	backup_2026-09-20T06-00-01.sql	D:\\dectracrm-cloud\\backend\\backups\\backup_2026-09-20T06-00-01.sql	92367	automatic	SUCCESS	\N	684	system	2026-09-20 06:00:01.210099
857483bb-c670-4d48-91c2-0ef0ad9365ed	backup_2026-09-21T06-00-01.sql	D:\\dectracrm-cloud\\backend\\backups\\backup_2026-09-21T06-00-01.sql	92697	automatic	SUCCESS	\N	1083	system	2026-09-21 06:00:01.517908
bee35dad-7b64-4917-973b-b3c734e20f9a	backup_2026-09-22T06-00-01.sql	D:\\dectracrm-cloud\\backend\\backups\\backup_2026-09-22T06-00-01.sql	93183	automatic	SUCCESS	\N	3095	system	2026-09-22 06:00:00.890194
c6f3dbd1-6e80-46d0-9e3c-306aa3ff6e61	backup_2026-09-22T17-46-19.sql	D:\\dectracrm-cloud\\backend\\backups\\backup_2026-09-22T17-46-19.sql	93464	manual	SUCCESS	\N	978	admin-user	2026-09-22 17:46:19.886294
ffe1c523-1b45-4c88-aaa9-7707846f59a8	backup_2026-09-23T06-00-03.sql	D:\\dectracrm-cloud\\backend\\backups\\backup_2026-09-23T06-00-03.sql	93667	automatic	SUCCESS	\N	7165	system	2026-09-23 06:00:02.529851
276c671a-91f5-47f1-83ff-da283605a5f6	backup_2026-09-24T06-00-01.sql	D:\\dectracrm-cloud\\backend\\backups\\backup_2026-09-24T06-00-01.sql	93950	automatic	SUCCESS	\N	1144	system	2026-09-24 06:00:01.68659
6df95cf0-7a61-4cb6-b30b-ef5db4b95f31	in_progress		0	automatic	IN_PROGRESS	\N	\N	system	2026-10-06 06:00:01.769339
\.


--
-- Data for Name: cash_flow_forecasts; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.cash_flow_forecasts (id, description, type, amount, "forecastDate", month, year, "isRecurring", "expenseId", status, "createdAt", "updatedAt") FROM stdin;
021fac6e-3c56-42f7-890e-d0932a8fe537	Contador	DESPESA	400.00	2026-11-14	11	2026	t	\N	PREVISTO	2026-09-24 22:58:58.990458	2026-09-24 22:58:58.990458
629a0082-f48a-4226-a08c-d8b09a37a8ed	Contador	DESPESA	400.00	2026-12-14	12	2026	t	\N	PREVISTO	2026-09-24 22:58:59.042285	2026-09-24 22:58:59.042285
c4e3be26-36f9-4261-9096-94d2c3d17872	Contador	DESPESA	400.00	2027-01-14	1	2027	t	\N	PREVISTO	2026-09-24 22:58:59.046305	2026-09-24 22:58:59.046305
6d67a681-7c4f-4d58-99bb-37505f2e0b33	Contador	DESPESA	400.00	2027-02-14	2	2027	t	\N	PREVISTO	2026-09-24 22:58:59.094697	2026-09-24 22:58:59.094697
01eccc28-7c5a-43b9-af1e-f8b547fce326	Contador	DESPESA	400.00	2027-03-14	3	2027	t	\N	PREVISTO	2026-09-24 22:58:59.114835	2026-09-24 22:58:59.114835
820fd092-0178-4a42-bb5e-d19029717a94	Contador	DESPESA	400.00	2027-04-14	4	2027	t	\N	PREVISTO	2026-09-24 22:58:59.118214	2026-09-24 22:58:59.118214
9ff6a54d-671d-4c1f-bd4f-60a80249029d	Contador	DESPESA	400.00	2027-05-14	5	2027	t	\N	PREVISTO	2026-09-24 22:58:59.121337	2026-09-24 22:58:59.121337
cc120f7e-f643-46a9-98bf-22d8fd773606	Contador	DESPESA	400.00	2027-06-14	6	2027	t	\N	PREVISTO	2026-09-24 22:58:59.124578	2026-09-24 22:58:59.124578
ffdaf558-2bf6-4e34-8660-fc631035c5f5	Contador	DESPESA	400.00	2027-07-14	7	2027	t	\N	PREVISTO	2026-09-24 22:58:59.127647	2026-09-24 22:58:59.127647
2177ffa3-3eb1-47da-8d23-022d5041f871	Contador	DESPESA	400.00	2027-08-14	8	2027	t	\N	PREVISTO	2026-09-24 22:58:59.150079	2026-09-24 22:58:59.150079
2a17edda-e702-4756-85e1-1a3533e422be	Contador	DESPESA	400.00	2027-09-14	9	2027	t	\N	PREVISTO	2026-09-24 22:58:59.153321	2026-09-24 22:58:59.153321
d83d4b2a-a494-4821-acf2-222c2e731720	IWILL design	DESPESA	1350.00	2026-12-14	12	2026	t	\N	PREVISTO	2026-10-02 20:41:52.630865	2026-10-02 20:41:52.630865
d094321b-3e02-48f9-a1bf-c1168cea95b8	IWILL design	DESPESA	1350.00	2027-01-14	1	2027	t	\N	PREVISTO	2026-10-02 20:41:52.647823	2026-10-02 20:41:52.647823
d1e94cbd-261a-44f5-bf3a-f415e34abf3c	IWILL design	DESPESA	1350.00	2027-02-14	2	2027	t	\N	PREVISTO	2026-10-02 20:41:52.651353	2026-10-02 20:41:52.651353
cb3e45ed-fe93-4f52-9356-d3cae23dccfd	IWILL design	DESPESA	1350.00	2027-03-14	3	2027	t	\N	PREVISTO	2026-10-02 20:41:52.655817	2026-10-02 20:41:52.655817
9c86c059-d556-4f86-89ec-d8df358c43d6	IWILL design	DESPESA	1350.00	2027-04-14	4	2027	t	\N	PREVISTO	2026-10-02 20:41:52.659792	2026-10-02 20:41:52.659792
36fd4b72-aa2b-4f6d-88b3-73067b62ded3	IWILL design	DESPESA	1350.00	2027-05-14	5	2027	t	\N	PREVISTO	2026-10-02 20:41:52.66371	2026-10-02 20:41:52.66371
2680a41a-1a12-43d5-b5c0-a1842fbc2eff	IWILL design	DESPESA	1350.00	2027-06-14	6	2027	t	\N	PREVISTO	2026-10-02 20:41:52.667136	2026-10-02 20:41:52.667136
1cc3f46f-eaef-4129-a37a-a8d1dafe4415	IWILL design	DESPESA	1350.00	2027-07-14	7	2027	t	\N	PREVISTO	2026-10-02 20:41:52.671273	2026-10-02 20:41:52.671273
52a6ca7b-ef12-4a3c-8d35-6d335eef76c3	IWILL design	DESPESA	1350.00	2027-08-14	8	2027	t	\N	PREVISTO	2026-10-02 20:41:52.675276	2026-10-02 20:41:52.675276
1434667f-b08a-4cf5-9f15-d6a7a6d32bc5	IWILL design	DESPESA	1350.00	2027-09-14	9	2027	t	\N	PREVISTO	2026-10-02 20:41:52.679271	2026-10-02 20:41:52.679271
04bc9765-f4a6-4fa5-b75c-ed68466dbc37	IWILL design	DESPESA	1350.00	2027-10-14	10	2027	t	\N	PREVISTO	2026-10-02 20:41:52.682603	2026-10-02 20:41:52.682603
03541c08-1ac1-46f5-98f7-d27a629d13d1	Google Drive	DESPESA	45.90	2026-12-14	12	2026	t	\N	PREVISTO	2026-10-02 20:43:39.125589	2026-10-02 20:43:39.125589
722882df-573b-4d90-a9c3-a7f477d3a59e	Google Drive	DESPESA	45.90	2027-01-14	1	2027	t	\N	PREVISTO	2026-10-02 20:43:39.12877	2026-10-02 20:43:39.12877
85d331db-5b72-49cb-89e4-bf7782178ed8	Google Drive	DESPESA	45.90	2027-02-14	2	2027	t	\N	PREVISTO	2026-10-02 20:43:39.131944	2026-10-02 20:43:39.131944
748a8a2a-37c6-4694-b3de-bc3865dcd204	Google Drive	DESPESA	45.90	2027-03-14	3	2027	t	\N	PREVISTO	2026-10-02 20:43:39.134832	2026-10-02 20:43:39.134832
68b03703-70cb-4595-9683-0aaaa15919b2	Google Drive	DESPESA	45.90	2027-04-14	4	2027	t	\N	PREVISTO	2026-10-02 20:43:39.138475	2026-10-02 20:43:39.138475
f3852d67-44e9-4a1f-a69b-b3072c8061fa	Google Drive	DESPESA	45.90	2027-05-14	5	2027	t	\N	PREVISTO	2026-10-02 20:43:39.141495	2026-10-02 20:43:39.141495
fc3b43a5-8ef7-425f-a067-952f5ff56574	Google Drive	DESPESA	45.90	2027-06-14	6	2027	t	\N	PREVISTO	2026-10-02 20:43:39.144241	2026-10-02 20:43:39.144241
370e1b24-ac3a-4d77-8a4e-987d3813d9f1	Google Drive	DESPESA	45.90	2027-07-14	7	2027	t	\N	PREVISTO	2026-10-02 20:43:39.147259	2026-10-02 20:43:39.147259
f7274e2c-87c3-43d7-b185-999d9e61cd78	Google Drive	DESPESA	45.90	2027-08-14	8	2027	t	\N	PREVISTO	2026-10-02 20:43:39.149968	2026-10-02 20:43:39.149968
b17ead88-5c87-4d9e-a11f-2a9df15a7619	Google Drive	DESPESA	45.90	2027-09-14	9	2027	t	\N	PREVISTO	2026-10-02 20:43:39.15277	2026-10-02 20:43:39.15277
959a13f1-f08e-4543-b7c6-38f5a6276282	Google Drive	DESPESA	45.90	2027-10-14	10	2027	t	\N	PREVISTO	2026-10-02 20:43:39.155837	2026-10-02 20:43:39.155837
19065673-48ff-4241-895a-1daab132fed6	Google Workspace	DESPESA	49.90	2026-12-04	12	2026	t	\N	PREVISTO	2026-10-02 22:02:35.603392	2026-10-02 22:02:35.603392
6fad7cc6-73b1-4dd3-ad9f-a257a068205d	Google Workspace	DESPESA	49.90	2027-01-04	1	2027	t	\N	PREVISTO	2026-10-02 22:02:35.607093	2026-10-02 22:02:35.607093
b561d6e2-6174-407e-b94b-6ab0a8f2059c	Google Workspace	DESPESA	49.90	2027-02-04	2	2027	t	\N	PREVISTO	2026-10-02 22:02:35.609902	2026-10-02 22:02:35.609902
6017dcc7-b65a-4f5f-98f6-cacf41979402	Google Workspace	DESPESA	49.90	2027-03-04	3	2027	t	\N	PREVISTO	2026-10-02 22:02:35.612659	2026-10-02 22:02:35.612659
76eecb76-732a-4746-84b6-918ea325352e	Google Workspace	DESPESA	49.90	2027-04-04	4	2027	t	\N	PREVISTO	2026-10-02 22:02:35.615351	2026-10-02 22:02:35.615351
877a3a22-cbc4-419b-941d-8a9dbfddb39f	Google Workspace	DESPESA	49.90	2027-05-04	5	2027	t	\N	PREVISTO	2026-10-02 22:02:35.618746	2026-10-02 22:02:35.618746
e2380fc9-5931-43eb-b121-a1022a2a6c9f	Google Workspace	DESPESA	49.90	2027-06-04	6	2027	t	\N	PREVISTO	2026-10-02 22:02:35.623982	2026-10-02 22:02:35.623982
0c2f7014-4d5b-46c3-a0c0-34942d086107	Google Workspace	DESPESA	49.90	2027-07-04	7	2027	t	\N	PREVISTO	2026-10-02 22:02:35.627998	2026-10-02 22:02:35.627998
2088efa7-e18d-4fac-b28c-6d1fce0b5640	Google Workspace	DESPESA	49.90	2027-08-04	8	2027	t	\N	PREVISTO	2026-10-02 22:02:35.632932	2026-10-02 22:02:35.632932
e94bd77a-418d-4a1b-a709-dfcf074824e9	Google Workspace	DESPESA	49.90	2027-09-04	9	2027	t	\N	PREVISTO	2026-10-02 22:02:35.655841	2026-10-02 22:02:35.655841
a39ca408-40bd-4508-bcad-fb43b14b604f	Google Workspace	DESPESA	49.90	2027-10-04	10	2027	t	\N	PREVISTO	2026-10-02 22:02:35.660526	2026-10-02 22:02:35.660526
7c13398c-24b7-448b-9dcc-51184c3a2c9c	Google Colab	DESPESA	58.00	2026-12-04	12	2026	t	\N	PREVISTO	2026-10-02 22:03:11.455479	2026-10-02 22:03:11.455479
fe510d05-4974-4c37-9ac7-d4edacfd6408	Google Colab	DESPESA	58.00	2027-01-04	1	2027	t	\N	PREVISTO	2026-10-02 22:03:11.45876	2026-10-02 22:03:11.45876
f34af759-b961-402f-bff4-db2400905b9a	Google Colab	DESPESA	58.00	2027-02-04	2	2027	t	\N	PREVISTO	2026-10-02 22:03:11.461396	2026-10-02 22:03:11.461396
ea500dec-4cd2-4751-bd5c-b7ea5e17aa66	Google Colab	DESPESA	58.00	2027-03-04	3	2027	t	\N	PREVISTO	2026-10-02 22:03:11.463821	2026-10-02 22:03:11.463821
9285f8eb-322e-4601-8746-bbe68cd6a4e1	Google Colab	DESPESA	58.00	2027-04-04	4	2027	t	\N	PREVISTO	2026-10-02 22:03:11.467598	2026-10-02 22:03:11.467598
8ba52b58-c6ff-4d39-bec2-bdce4f74f021	Google Colab	DESPESA	58.00	2027-05-04	5	2027	t	\N	PREVISTO	2026-10-02 22:03:11.470346	2026-10-02 22:03:11.470346
008148ed-ba30-4cab-8909-2831cde079a2	Google Colab	DESPESA	58.00	2027-06-04	6	2027	t	\N	PREVISTO	2026-10-02 22:03:11.47272	2026-10-02 22:03:11.47272
ceed2cd2-7663-48e7-9c7c-f56ae3798040	Google Colab	DESPESA	58.00	2027-07-04	7	2027	t	\N	PREVISTO	2026-10-02 22:03:11.474951	2026-10-02 22:03:11.474951
f92105b0-3f6b-4068-a1ad-984695c02aca	Google Colab	DESPESA	58.00	2027-08-04	8	2027	t	\N	PREVISTO	2026-10-02 22:03:11.477373	2026-10-02 22:03:11.477373
cb22fc90-9312-49ee-8ff5-45440fc3e0b9	Google Colab	DESPESA	58.00	2027-09-04	9	2027	t	\N	PREVISTO	2026-10-02 22:03:11.479874	2026-10-02 22:03:11.479874
8ca2cdea-8bc2-4340-95ce-5aaaeba738ef	Google Colab	DESPESA	58.00	2027-10-04	10	2027	t	\N	PREVISTO	2026-10-02 22:03:11.483065	2026-10-02 22:03:11.483065
b104b0c9-4a90-459c-be8e-6a38e9a97370	Canva Pro	DESPESA	35.00	2026-12-04	12	2026	t	\N	PREVISTO	2026-10-02 22:03:37.260928	2026-10-02 22:03:37.260928
a6edc25f-e3a2-41b5-a326-f73372bae68f	Canva Pro	DESPESA	35.00	2027-01-04	1	2027	t	\N	PREVISTO	2026-10-02 22:03:37.263793	2026-10-02 22:03:37.263793
83886752-b258-4620-8915-a92dce7543e9	Canva Pro	DESPESA	35.00	2027-02-04	2	2027	t	\N	PREVISTO	2026-10-02 22:03:37.267173	2026-10-02 22:03:37.267173
e82cc6cf-a405-4058-adb6-38d9293c0b8a	Canva Pro	DESPESA	35.00	2027-03-04	3	2027	t	\N	PREVISTO	2026-10-02 22:03:37.270888	2026-10-02 22:03:37.270888
35611d21-3b8b-4f61-ad65-fb30f8bbad9e	Canva Pro	DESPESA	35.00	2027-04-04	4	2027	t	\N	PREVISTO	2026-10-02 22:03:37.273752	2026-10-02 22:03:37.273752
b3a656b8-cd7f-4fdd-ba63-07328e9392a5	Canva Pro	DESPESA	35.00	2027-05-04	5	2027	t	\N	PREVISTO	2026-10-02 22:03:37.27638	2026-10-02 22:03:37.27638
829b5a3f-833a-44e7-8a54-c1ac5f48a0e1	Canva Pro	DESPESA	35.00	2027-06-04	6	2027	t	\N	PREVISTO	2026-10-02 22:03:37.278958	2026-10-02 22:03:37.278958
f515aafe-3ebd-41ec-8efb-788895c51777	Canva Pro	DESPESA	35.00	2027-07-04	7	2027	t	\N	PREVISTO	2026-10-02 22:03:37.28165	2026-10-02 22:03:37.28165
dc4f35fe-6879-4c40-9a87-92158ad4e1a9	Canva Pro	DESPESA	35.00	2027-08-04	8	2027	t	\N	PREVISTO	2026-10-02 22:03:37.285033	2026-10-02 22:03:37.285033
64ab0fcf-531a-4c75-b3e0-6e8a22f81667	Canva Pro	DESPESA	35.00	2027-09-04	9	2027	t	\N	PREVISTO	2026-10-02 22:03:37.287474	2026-10-02 22:03:37.287474
8f37283f-1c85-4ab5-bb6e-b9e5159a6ba2	Canva Pro	DESPESA	35.00	2027-10-04	10	2027	t	\N	PREVISTO	2026-10-02 22:03:37.289881	2026-10-02 22:03:37.289881
63b7dc64-35bd-42d9-bfe5-802759103fdc	Chat GPT	DESPESA	107.52	2026-12-04	12	2026	t	\N	PREVISTO	2026-10-02 22:05:34.529669	2026-10-02 22:05:34.529669
79b75129-ba0a-4d55-bfbd-d6643d4b616c	Chat GPT	DESPESA	107.52	2027-01-04	1	2027	t	\N	PREVISTO	2026-10-02 22:05:34.53296	2026-10-02 22:05:34.53296
9bd29e48-7811-4531-9f3a-706b0553c2bd	Chat GPT	DESPESA	107.52	2027-02-04	2	2027	t	\N	PREVISTO	2026-10-02 22:05:34.536788	2026-10-02 22:05:34.536788
bc59386c-b8ac-4e7b-973b-6aca47c48e84	Chat GPT	DESPESA	107.52	2027-03-04	3	2027	t	\N	PREVISTO	2026-10-02 22:05:34.539423	2026-10-02 22:05:34.539423
14023c9f-2e67-4c4c-afde-23c6ccf0ade5	Chat GPT	DESPESA	107.52	2027-04-04	4	2027	t	\N	PREVISTO	2026-10-02 22:05:34.542169	2026-10-02 22:05:34.542169
8015384d-1516-4ea6-a5cf-5848d3886ad0	Chat GPT	DESPESA	107.52	2027-05-04	5	2027	t	\N	PREVISTO	2026-10-02 22:05:34.544817	2026-10-02 22:05:34.544817
136acaf2-202b-4b1c-b1a0-d82d7f40b67f	Chat GPT	DESPESA	107.52	2027-06-04	6	2027	t	\N	PREVISTO	2026-10-02 22:05:34.54723	2026-10-02 22:05:34.54723
ad7ee130-32d7-4f28-a07d-0948f4190e04	Chat GPT	DESPESA	107.52	2027-07-04	7	2027	t	\N	PREVISTO	2026-10-02 22:05:34.550009	2026-10-02 22:05:34.550009
1891cd9f-2072-404f-8a4e-6cd6cbf8a342	Chat GPT	DESPESA	107.52	2027-08-04	8	2027	t	\N	PREVISTO	2026-10-02 22:05:34.552819	2026-10-02 22:05:34.552819
c3e245b1-a1fb-4502-b207-8f884736ebd1	Chat GPT	DESPESA	107.52	2027-09-04	9	2027	t	\N	PREVISTO	2026-10-02 22:05:34.555523	2026-10-02 22:05:34.555523
c44aa5d1-9c79-4369-a0f0-4dca9136151e	Chat GPT	DESPESA	107.52	2027-10-04	10	2027	t	\N	PREVISTO	2026-10-02 22:05:34.558147	2026-10-02 22:05:34.558147
0d4ad872-0fb0-4a33-8ef1-b400eb9884a1	Emissor de NFE	DESPESA	8.90	2026-11-30	11	2026	t	\N	PREVISTO	2026-10-02 22:06:36.241617	2026-10-02 22:06:36.241617
8805f609-501b-44d1-83f8-4b68a676af8b	Emissor de NFE	DESPESA	8.90	2026-12-30	12	2026	t	\N	PREVISTO	2026-10-02 22:06:36.244697	2026-10-02 22:06:36.244697
9ebe04f2-8256-4baa-b4fd-e37c5b857ebd	Emissor de NFE	DESPESA	8.90	2027-01-30	1	2027	t	\N	PREVISTO	2026-10-02 22:06:36.247203	2026-10-02 22:06:36.247203
44d84299-7ca1-4d82-849b-558b556ae3c4	Emissor de NFE	DESPESA	8.90	2027-03-30	3	2027	t	\N	PREVISTO	2026-10-02 22:06:36.250518	2026-10-02 22:06:36.250518
82ed673d-5868-43c6-b697-543c01d2d1dd	Emissor de NFE	DESPESA	8.90	2027-04-30	4	2027	t	\N	PREVISTO	2026-10-02 22:06:36.253529	2026-10-02 22:06:36.253529
a3691c87-1eaa-41e0-913c-7cf72479c86c	Emissor de NFE	DESPESA	8.90	2027-05-30	5	2027	t	\N	PREVISTO	2026-10-02 22:06:36.256327	2026-10-02 22:06:36.256327
8fe1613c-6163-4438-8123-6e0e52f28fca	Emissor de NFE	DESPESA	8.90	2027-06-30	6	2027	t	\N	PREVISTO	2026-10-02 22:06:36.258875	2026-10-02 22:06:36.258875
0fcc932d-3c5b-475a-ac56-836010587df3	Emissor de NFE	DESPESA	8.90	2027-07-30	7	2027	t	\N	PREVISTO	2026-10-02 22:06:36.261377	2026-10-02 22:06:36.261377
0d133183-cfd3-4b5d-96c0-d48139b1c589	Emissor de NFE	DESPESA	8.90	2027-08-30	8	2027	t	\N	PREVISTO	2026-10-02 22:06:36.264081	2026-10-02 22:06:36.264081
fd98c926-f175-4ce2-ba45-16f6cb96d425	Emissor de NFE	DESPESA	8.90	2027-09-30	9	2027	t	\N	PREVISTO	2026-10-02 22:06:36.26714	2026-10-02 22:06:36.26714
f4cdee0a-ac71-4f36-8cfc-7eb4ba2d0e8a	Emissor de NFE	DESPESA	8.90	2027-10-30	10	2027	t	\N	PREVISTO	2026-10-02 22:06:36.269762	2026-10-02 22:06:36.269762
101c49bb-adf7-4e14-b310-bcfe3fb34dc2	Pró-Labore Carlos Rocha	DESPESA	4700.00	2026-12-08	12	2026	t	\N	PREVISTO	2026-10-05 10:18:17.467836	2026-10-05 10:18:17.467836
8112b0f2-0af7-4edb-ae28-d08ee3848ed0	Pró-Labore Carlos Rocha	DESPESA	4700.00	2027-01-08	1	2027	t	\N	PREVISTO	2026-10-05 10:18:17.472106	2026-10-05 10:18:17.472106
54c233e1-1fd8-45e2-bd0a-25fa98c3e0e9	Pró-Labore Carlos Rocha	DESPESA	4700.00	2027-02-08	2	2027	t	\N	PREVISTO	2026-10-05 10:18:17.475529	2026-10-05 10:18:17.475529
8d0447dc-1adf-44f6-a18b-bbfa31e054c1	Pró-Labore Carlos Rocha	DESPESA	4700.00	2027-03-08	3	2027	t	\N	PREVISTO	2026-10-05 10:18:17.478515	2026-10-05 10:18:17.478515
3360023a-a883-4f7c-8d2a-8abff2afe05b	Pró-Labore Carlos Rocha	DESPESA	4700.00	2027-04-08	4	2027	t	\N	PREVISTO	2026-10-05 10:18:17.481153	2026-10-05 10:18:17.481153
8f10be06-7f7e-44f2-ad50-e2195865f14b	Pró-Labore Carlos Rocha	DESPESA	4700.00	2027-05-08	5	2027	t	\N	PREVISTO	2026-10-05 10:18:17.484034	2026-10-05 10:18:17.484034
8bfbce05-8279-43a3-a43d-83e54d8261b5	Pró-Labore Carlos Rocha	DESPESA	4700.00	2027-06-08	6	2027	t	\N	PREVISTO	2026-10-05 10:18:17.486946	2026-10-05 10:18:17.486946
b9506173-637e-4860-a0fa-831afa58e291	Pró-Labore Carlos Rocha	DESPESA	4700.00	2027-07-08	7	2027	t	\N	PREVISTO	2026-10-05 10:18:17.489714	2026-10-05 10:18:17.489714
f9c51868-96e0-4063-a119-7f71eb3cdecc	Pró-Labore Carlos Rocha	DESPESA	4700.00	2027-08-08	8	2027	t	\N	PREVISTO	2026-10-05 10:18:17.493093	2026-10-05 10:18:17.493093
0c1881bc-4794-4b1f-b676-824cb43d669f	Pró-Labore Carlos Rocha	DESPESA	4700.00	2027-09-08	9	2027	t	\N	PREVISTO	2026-10-05 10:18:17.495742	2026-10-05 10:18:17.495742
b2c20e41-8450-4f9c-b42a-183025531edd	Pró-Labore Carlos Rocha	DESPESA	4700.00	2027-10-08	10	2027	t	\N	PREVISTO	2026-10-05 10:18:17.498475	2026-10-05 10:18:17.498475
6a5bde5a-75af-4514-88d8-b8b416626f28	Pró-Labore Cleiber Nichida	DESPESA	4300.00	2026-12-08	12	2026	t	\N	PREVISTO	2026-10-05 10:19:13.013847	2026-10-05 10:19:13.013847
3558f828-b908-44bb-ac06-039714e09966	Pró-Labore Cleiber Nichida	DESPESA	4300.00	2027-01-08	1	2027	t	\N	PREVISTO	2026-10-05 10:19:13.017518	2026-10-05 10:19:13.017518
3bf5981b-a278-49d2-8bba-39cc7698b4dc	Pró-Labore Cleiber Nichida	DESPESA	4300.00	2027-02-08	2	2027	t	\N	PREVISTO	2026-10-05 10:19:13.020246	2026-10-05 10:19:13.020246
ca8eb332-f4e0-4067-a39e-8ba8cbba9f2d	Pró-Labore Cleiber Nichida	DESPESA	4300.00	2027-03-08	3	2027	t	\N	PREVISTO	2026-10-05 10:19:13.023063	2026-10-05 10:19:13.023063
dea73d19-3890-491c-94db-6f40a4028da2	Pró-Labore Cleiber Nichida	DESPESA	4300.00	2027-04-08	4	2027	t	\N	PREVISTO	2026-10-05 10:19:13.025867	2026-10-05 10:19:13.025867
53daa7cc-c9c8-404b-be94-87938504a0e5	Pró-Labore Cleiber Nichida	DESPESA	4300.00	2027-05-08	5	2027	t	\N	PREVISTO	2026-10-05 10:19:13.04549	2026-10-05 10:19:13.04549
ab68fa8d-bfbf-4f66-80ac-51ff4e84011f	Pró-Labore Cleiber Nichida	DESPESA	4300.00	2027-06-08	6	2027	t	\N	PREVISTO	2026-10-05 10:19:13.048751	2026-10-05 10:19:13.048751
76a3cd0a-28c7-44e9-9e1a-0bb955e07e3e	Pró-Labore Cleiber Nichida	DESPESA	4300.00	2027-07-08	7	2027	t	\N	PREVISTO	2026-10-05 10:19:13.051299	2026-10-05 10:19:13.051299
21ed52f5-e8f9-4cab-bf3c-ff5aba68d589	Pró-Labore Cleiber Nichida	DESPESA	4300.00	2027-08-08	8	2027	t	\N	PREVISTO	2026-10-05 10:19:13.053714	2026-10-05 10:19:13.053714
270838aa-ac0c-4745-a489-ab416567b600	Pró-Labore Cleiber Nichida	DESPESA	4300.00	2027-09-08	9	2027	t	\N	PREVISTO	2026-10-05 10:19:13.056536	2026-10-05 10:19:13.056536
5a1d1cde-d533-45ea-82ce-fcd73a865e6b	Pró-Labore Cleiber Nichida	DESPESA	4300.00	2027-10-08	10	2027	t	\N	PREVISTO	2026-10-05 10:19:13.059113	2026-10-05 10:19:13.059113
\.


--
-- Data for Name: contracts; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.contracts (id, "customerId", type, "totalValue", "startDate", "endDate", "billingDate", status, installments, frequency, "paymentCondition", title, "createdAt", "updatedAt") FROM stdin;
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
c6554c41-9341-4cd0-8620-782329e8b0f6	395f1a0f-934b-4d02-a96d-4cbffc2f91d4	SERVICO	3446.70	2025-01-02	2025-01-03	2025-01-02	ATIVO	1	MENSAL	À VISTA	UFV Lençóis Paulista I - 01/09/2025	2026-09-02 18:57:09.299297	2026-09-21 19:48:53.948063
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
d8604931-72a1-457b-b9b6-f348977b5580	Pró-Labore	\N	DESPESA	f	2026-10-05 10:17:23.714072	2026-10-05 10:17:23.714072
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.expenses (id, description, "expenseTypeId", amount, "expenseDate", "dueDate", status, notes, "isRecurring", "recurrencePeriod", "recurrenceCount", "recurrenceEndDate", "createdAt", "updatedAt", "generatesReceipt", "autoConfirmOnDueDate") FROM stdin;
2b4d4f4a-32e4-424e-8b5a-4c9f7d6077e9	Contador	262989d2-804e-4602-8f23-4be066e954dd	400.00	2026-09-15	2026-09-15	PAGO	\N	t	MENSAL	12	\N	2026-09-24 22:58:58.33583	2026-09-24 22:59:10.771526	f	f
652c9476-e2f9-49ea-9ff5-fb54f18bb050	IWILL design	7560fc29-af3a-4370-9149-dc225fb23397	1350.00	2026-10-15	2026-10-15	PENDENTE	\N	t	MENSAL	12	\N	2026-10-02 20:41:52.241305	2026-10-02 20:41:52.62635	f	f
042e955f-17fb-45c4-9034-be83fda432e0	Google Drive	8b3de120-583c-4d55-bc17-e9200b1a999e	45.90	2026-10-05	2026-10-15	PENDENTE	\N	t	MENSAL	12	\N	2026-10-02 20:43:39.105529	2026-10-02 20:44:35.721629	f	f
8235073e-ec18-4180-8177-8f2748aab700	Google Workspace	8b3de120-583c-4d55-bc17-e9200b1a999e	49.90	2026-10-05	2026-10-05	PENDENTE	\N	t	MENSAL	12	\N	2026-10-02 22:02:35.585733	2026-10-02 22:02:35.599175	f	f
553adbb7-7760-4f84-afd6-4364633d85fa	Google Colab	8b3de120-583c-4d55-bc17-e9200b1a999e	58.00	2026-10-05	2026-10-05	PENDENTE	\N	t	MENSAL	12	\N	2026-10-02 22:03:11.435769	2026-10-02 22:03:11.451643	f	f
86dc61f6-dd89-410b-b67a-5bd2ec8303d0	Claude	8b3de120-583c-4d55-bc17-e9200b1a999e	118.20	2026-10-05	2026-10-05	PENDENTE	\N	f	MONTHLY	12	\N	2026-10-02 22:04:06.324112	2026-10-02 22:04:06.324112	f	f
06bcd690-0f7e-404f-9c25-d91a4c048fe6	Chat GPT	8b3de120-583c-4d55-bc17-e9200b1a999e	107.52	2026-10-05	2026-10-05	PENDENTE	\N	t	MENSAL	12	\N	2026-10-02 22:05:34.516296	2026-10-02 22:05:34.52687	f	f
beba77ef-a0ac-4d26-820b-682a8d6208c6	Canva Pro	8b3de120-583c-4d55-bc17-e9200b1a999e	35.00	2026-10-05	2026-10-05	PENDENTE	\N	t	MENSAL	12	\N	2026-10-02 22:03:37.243963	2026-10-02 22:05:49.844006	f	f
bf95fef0-1172-4564-a1b5-3361347c9867	Pró-Labore Carlos Rocha	262989d2-804e-4602-8f23-4be066e954dd	4700.00	2026-10-09	2026-10-09	PENDENTE	\N	t	MENSAL	12	\N	2026-10-05 10:18:17.43644	2026-10-05 10:18:17.463898	f	f
1ed6afb1-2f98-44a6-9aa3-9dffb2ff020d	Pró-Labore Cleiber Nichida	d8604931-72a1-457b-b9b6-f348977b5580	4300.00	2026-10-09	2026-10-09	PENDENTE	\N	t	MENSAL	12	\N	2026-10-05 10:19:12.995329	2026-10-05 10:19:13.010719	f	f
e16388b7-cd64-4c1f-8b5c-1d521be63ec4	Emissor de NFE	262989d2-804e-4602-8f23-4be066e954dd	8.90	2026-10-01	2026-10-01	PENDENTE	\N	t	MENSAL	12	\N	2026-10-02 22:06:36.223237	2026-10-05 21:36:59.060528	f	f
\.


--
-- Data for Name: financial_categories; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.financial_categories (id, name, type, description, "isActive", "createdAt", "updatedAt") FROM stdin;
d4b50a33-05dc-4ce5-8964-d1220086dea9	Serviços	RECEITA	Receitas provenientes de serviços prestados	t	2026-09-17 23:17:24.832841	2026-09-17 23:17:24.832841
ec4ef4f5-544d-4d3e-b535-df3a817e7555	Produtos	RECEITA	Venda de produtos	t	2026-09-17 23:17:24.832841	2026-09-17 23:17:24.832841
62572b8d-bbee-425d-b34f-8c456dfb8601	Projetos	RECEITA	Receitas de projetos específicos	t	2026-09-17 23:17:24.832841	2026-09-17 23:17:24.832841
d5d33bdc-ff8b-4f80-8c22-dff9a52a2594	Outros	RECEITA	Outras receitas	t	2026-09-17 23:17:24.832841	2026-09-17 23:17:24.832841
ef4a1ef3-21d6-48e3-b215-5057a041fad2	Fornecedores	DESPESA	Pagamentos a fornecedores	t	2026-09-17 23:17:24.832841	2026-09-17 23:17:24.832841
94897f89-370b-4608-bb42-d49281c65ce4	Impostos	DESPESA	Tributos e impostos	t	2026-09-17 23:17:24.832841	2026-09-17 23:17:24.832841
c609901c-ce30-465d-a824-19787a0bcb93	Folha	DESPESA	Pagamentos de salários e encargos	t	2026-09-17 23:17:24.832841	2026-09-17 23:17:24.832841
9aef772c-a285-49f6-a86c-a3ebb51a1da4	Aluguel	DESPESA	Despesas com aluguel	t	2026-09-17 23:17:24.832841	2026-09-17 23:17:24.832841
58c9a604-b79b-4082-b598-2914539ada77	Marketing	DESPESA	Despesas com publicidade e marketing	t	2026-09-17 23:17:24.832841	2026-09-17 23:17:24.832841
824dcfbd-57b8-47ee-b72c-b300b39e9e33	Tecnologia	DESPESA	Softwares, hospedagem e equipamentos	t	2026-09-17 23:17:24.832841	2026-09-17 23:17:24.832841
c7d1381b-c74d-45c4-9b22-2dbc94036e4b	Outros	DESPESA	Outras despesas	t	2026-09-17 23:17:24.832841	2026-09-17 23:17:24.832841
97215b94-1b50-414e-80b5-23685b26145c	Editais	RECEITA	Receitas provenientes de editais e prêmios	t	2026-09-17 23:17:24.832841	2026-09-22 12:43:08.817346
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
84d84cfc-f481-4774-a689-86815652d1a5	246.96	2024-10-11	Impostos	\N	\N	2026-09-19 00:30:13.733961	2026-09-20 22:42:06.18149	2024-10-11	\N	f	Pagamento de Convenio SIMPLES NACIONAL	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
69848b95-2d1e-4ef6-a0f6-aa174d5e169f	142.00	2024-08-22	Outros	\N	\N	2026-09-19 00:30:13.718148	2026-09-21 21:27:13.159157	2024-08-22	\N	f	Pagamento efetuado INSTITUTO NACIONAL DA PROPRIEDADE INDUSTRIAL . INP	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
cc268ce5-8db3-40b4-bc67-bb44ef645ce5	223.03	2024-08-14	Impostos	\N	\N	2026-09-19 00:30:13.687031	2026-09-21 21:32:25.478012	2024-08-14	\N	f	Pix enviado: "Cp :60701190-GOIANIA PREFEITURA MUNICIPAL GABINETE"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
823196be-dec2-4ce6-844a-a4d49c74d3f7	202.92	2024-08-19	Impostos	\N	\N	2026-09-19 00:30:13.703607	2026-09-21 21:33:58.016637	2024-08-19	\N	f	Pagamento de Convenio PREFEITURA MUNICIPAL GOIANIA GO	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
dd3873d4-dbf0-411b-9d01-7752f442f281	875.00	2025-03-21	Folha	\N	\N	2026-09-19 00:30:13.755136	2026-09-22 12:57:51.221879	2025-03-21	\N	f	Pix enviado: "Cp :18236120-Nicole Liecheski"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
7bce5b2c-bd83-41b2-b727-b985cc37c5a9	211.72	2025-03-21	Impostos	\N	\N	2026-09-19 00:30:13.76911	2026-09-22 12:58:18.142108	2025-03-21	\N	f	Pix enviado: "Cp :00000000-RECEITA FEDERAL"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
730426e9-b651-47be-8dce-0004579a64c4	6919.89	2025-06-02	Tecnologia	\N	\N	2026-09-19 00:30:13.89293	2026-09-22 14:01:48.022649	2025-06-02	\N	f	Pix enviado: "Cp :13884775-Magazine Luiza Marketplace"	PAGO	\N	\N	DESPESA_OPERACIONAL
afac0aa3-e3f0-4f7b-a7b5-9836a8b5b02d	1150.00	2025-04-22	Folha	\N	\N	2026-09-19 00:30:13.811109	2026-09-22 14:08:42.794645	2025-04-22	\N	f	Pix enviado: "Cp :60701190-Grazielly Vieira Lima"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
11f0723a-ee2d-401a-b14c-66c8ce763d59	31619.91	2025-05-02	Tecnologia	\N	\N	2026-09-19 00:30:13.82847	2026-09-22 14:09:17.280755	2025-05-02	\N	f	Pix enviado: "Cp :00000000-Nw Drones Comercio E Manutencao de Drones LTDA"	PAGO	\N	\N	DESPESA_OPERACIONAL
c57f3231-9e9a-4bbe-9345-916be60986e3	875.00	2025-05-07	Folha	\N	\N	2026-09-19 00:30:13.84578	2026-09-22 14:09:54.334643	2025-05-07	\N	f	Pix enviado: "Cp :00000000-Nicole Liecheski"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
04df56f0-26f1-44af-98cb-950b537b621a	1150.00	2025-06-24	Folha	\N	\N	2026-09-19 00:30:13.9407	2026-09-22 14:10:30.092245	2025-06-24	\N	f	Pix enviado: "Cp :60701190-Grazielly Vieira Lima"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
bebebc80-c2a0-45d0-82b3-3bb629a2378c	1150.00	2025-05-21	Folha	\N	\N	2026-09-19 00:30:13.860783	2026-09-22 14:41:57.658111	2025-05-21	\N	f	Pix enviado: "Cp :60701190-Grazielly Vieira Lima"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
ace9a08d-27a7-4723-ad71-98357134205b	6660.00	2025-07-25	Tecnologia	\N	\N	2026-09-19 00:30:14.083743	2026-09-22 14:48:58.381163	2025-07-25	\N	f	Pix enviado: "Cp :00000000-NW DRONES COMERCIO E MANUTENCAO DE DRONES LTDA"	PAGO	\N	\N	DESPESA_OPERACIONAL
9f39f3d2-7347-4b64-8383-64789518b0e5	3853.13	2025-05-21	Impostos	\N	\N	2026-09-19 00:30:13.875305	2026-09-22 14:49:25.159367	2025-05-21	\N	f	Pix enviado: "Cp :00000000-RECEITA FEDERAL"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
2767fb9d-80a3-4d6f-bead-0c47012f0fa1	960.00	2025-06-06	Aluguel	\N	\N	2026-09-19 00:30:13.908764	2026-09-23 11:22:56.68782	2025-06-06	\N	f	Pix enviado: "Cp :15111975-COMPANY HERO LTDA"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
e19512e8-82e8-42a5-af84-6ec598384206	35.00	2025-07-08	Outros	\N	\N	2026-09-19 00:30:13.957454	2026-09-24 23:03:42.397527	2025-07-08	\N	f	Pagamento efetuado: "Pagamento fatura cartao Inter"	PAGO	\N	\N	DESPESA_OPERACIONAL
f95819b3-4fdd-4b5e-8529-449a16ad102f	1791.17	2025-07-14	Outros	\N	\N	2026-09-19 00:30:13.973147	2026-09-24 23:04:12.91501	2025-07-14	\N	f	Pix enviado: "Cp :10573521-Cleiber Nichida"	PAGO	\N	13210761-d111-47f7-8497-96c9acb21b1e	DESPESA_OPERACIONAL
875d2222-da77-4756-b658-d2f98a8ba1e9	875.00	2025-07-14	Folha	\N	\N	2026-09-19 00:30:13.988377	2026-09-24 23:04:36.519106	2025-07-14	\N	f	Pix enviado: "Cp :18236120-Nicole Liecheski"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
07828cad-21aa-4a6b-b0b9-8cd5db64824a	103.03	2025-07-22	Outros	\N	\N	2026-09-19 00:30:14.043955	2026-09-24 23:05:18.897719	2025-07-22	\N	f	Pix enviado: "Cp :00000000-CONSELHO REGIONAL DE ENGENHARIA E AGRONOMIA DE GOIAS"	PAGO	\N	4bf0f050-1cdd-48c3-807f-49c74f7bfe1e	DESPESA_OPERACIONAL
ee99b560-493c-40c9-b587-9877abe09c39	271.47	2025-07-22	Outros	\N	\N	2026-09-19 00:30:14.057634	2026-09-24 23:05:45.973324	2025-07-22	\N	f	Pix enviado: "Cp :00000000-CONSELHO REGIONAL DE ENGENHARIA E AGRONOMIA DE GOIAS"	PAGO	\N	45008448-f22a-4041-9409-f6bef64ab65e	DESPESA_OPERACIONAL
0f7a8c4b-6b33-4aa1-a93d-430ee80c63f9	4814.05	2025-07-24	Impostos	\N	\N	2026-09-19 00:30:14.070623	2026-09-24 23:07:34.159894	2025-07-24	\N	f	Pix enviado: "Cp :00000000-RECEITA FEDERAL"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
5814568d-bd19-4a2b-b556-dbcf50d458a6	199.99	2025-08-06	Outros	\N	\N	2026-09-19 00:30:14.109662	2026-10-02 17:50:27.699442	2025-08-06	\N	f	Pix enviado: "Cp :60701190-TOBELLI COMERCIO DE CALCADOS LTDA"	PAGO	\N	\N	DESPESA_OPERACIONAL
3514249f-548f-4da4-bd95-375aa1cb8428	73.10	2025-08-11	Outros	\N	\N	2026-09-19 00:30:14.120872	2026-10-02 17:50:51.121612	2025-08-11	\N	f	Pagamento efetuado: "Pagamento fatura cartao Inter"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
a26ba41a-e76f-458d-8324-54f702046d28	649.44	2025-08-21	Outros	\N	\N	2026-09-19 00:30:14.134878	2026-10-02 17:51:26.549052	2025-08-21	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
c9cc6e1b-4195-446d-bee4-760c7ba0f06c	129.70	2025-08-25	Impostos	\N	\N	2026-09-19 00:30:14.146563	2026-10-02 17:58:39.605646	2025-08-25	\N	f	Pix enviado: "Cp :60701190-GOIANIA PREFEITURA MUNICIPAL GABINETE DO PREFEITO"	PAGO	\N	f0c13842-f99e-44bd-9ab9-880efa3f274d	DESPESA_ADMINISTRATIVA
ffc33338-75ed-4658-aa9b-e65ed91964fb	129.70	2025-08-26	Outros	\N	\N	2026-09-19 00:30:14.157489	2026-10-02 17:59:07.662203	2025-08-26	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
58f76204-946a-4b9f-95e8-c8c1b024e95e	338.00	2025-09-04	Impostos	\N	\N	2026-09-19 00:30:14.182147	2026-10-02 17:59:52.271661	2025-09-04	\N	f	Pagamento de Convenio: "DARE - DEMAIS ORGAOS GO"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
9d99deec-207b-4a38-a132-43f17afebadd	294.85	2025-09-04	Impostos	\N	\N	2026-09-19 00:30:14.19469	2026-10-02 18:01:04.443242	2025-09-04	\N	f	Pagamento efetuado: "CONSELHO NACIONAL DE DESENVOLVIMENTO CIENTIFICO E"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
1d12a8c4-261f-4fe9-bf0f-a054d5ededba	5294.46	2025-09-12	Outros	\N	\N	2026-09-19 00:30:14.235101	2026-10-02 20:06:04.620784	2025-09-12	\N	f	Pix enviado: "Cp :90400888-IATA INTERNATIONAL AIR TRANSPORT ASSOCIATION"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
60af1ea2-5c00-4a1e-a23a-79b1b8784118	1476.72	2025-09-11	Outros	\N	\N	2026-09-19 00:30:14.214677	2026-10-02 18:02:03.849978	2025-09-11	\N	f	Pix enviado: "Cp :10573521-Cleiber Nichida"	PAGO	\N	\N	DESPESA_OPERACIONAL
cdeabf3e-ebb7-49a6-962b-639bb22787f3	463.98	2025-09-11	Outros	\N	\N	2026-09-19 00:30:14.204038	2026-10-02 18:02:20.54144	2025-09-11	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
ec6ca53f-30f3-48e0-8beb-5c5b9cd229e7	400.00	2025-09-24	Outros	\N	\N	2026-09-19 00:30:14.247131	2026-10-02 20:09:11.232753	2025-09-24	\N	f	Pix enviado: "Cp :06332931-Kleber Ramos de Morais"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
b737a6ee-1d58-483b-86d9-b2cb241a2a44	100.00	2025-09-24	Outros	\N	\N	2026-09-19 00:30:14.258696	2026-10-02 20:09:31.203602	2025-09-24	\N	f	Pagamento efetuado: "Pagamento fatura cartao Inter"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
55a4a651-8df4-40bf-a834-a15de62b7e57	78.96	2025-10-14	Outros	\N	\N	2026-09-19 00:30:14.353054	2026-10-02 20:11:32.477926	2025-10-14	\N	f	Pix enviado: "Cp :10573521-Cleiber Nichida"	PAGO	\N	\N	DESPESA_OPERACIONAL
8a2ef8dd-69f8-40d2-9c13-fbd1f7f289f3	1150.00	2025-09-24	Folha	\N	\N	2026-09-19 00:30:14.270537	2026-10-02 20:12:20.588298	2025-09-24	\N	f	Pix enviado: "Cp :60701190-Grazielly Vieira Lima"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
1ab466ff-55d4-4b2d-9a3a-afb40f34dea2	972.60	2025-10-09	Outros	\N	\N	2026-09-19 00:30:14.329823	2026-10-02 20:16:05.164905	2025-10-09	\N	f	Pagamento efetuado: "Pagamento fatura cartao Inter"	PAGO	\N	\N	DESPESA_OPERACIONAL
a47653cd-a3e0-42c0-814b-bfbc7d536243	2500.00	2025-09-26	Folha	\N	\N	2026-09-19 00:30:14.294693	2026-10-02 20:17:42.399868	2025-09-26	\N	f	Pix enviado: "Cp :10573521-Cleiber Nichida"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
7c12ded6-140d-46a8-93b9-6daa402abd30	3500.00	2025-09-26	Folha	\N	\N	2026-09-19 00:30:14.306204	2026-10-02 20:18:01.817532	2025-09-26	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
7ab8d926-8713-4573-a59d-18d9c633aafa	875.00	2025-10-09	Outros	\N	\N	2026-09-19 00:30:14.341075	2026-10-02 20:18:53.221594	2025-10-09	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
81951f55-8aa1-41de-94c7-05f34134acbe	3500.00	2025-10-15	Folha	\N	\N	2026-09-19 00:30:14.365098	2026-10-02 20:19:23.62228	2025-10-15	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
f7ee1a8c-7548-4c03-a87c-3d6892782ba1	2500.00	2025-10-15	Folha	\N	\N	2026-09-19 00:30:14.37658	2026-10-02 20:19:39.418072	2025-10-15	\N	f	Pix enviado: "Cp :10573521-Cleiber Nichida"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
5498ff69-d9fa-458a-986a-f9a89cb303ee	112.46	2025-10-20	Impostos	\N	\N	2026-09-19 00:30:14.387428	2026-10-02 20:19:56.633431	2025-10-20	\N	f	Pix enviado: "Cp :60701190-RECEITA FEDERAL"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
374fa4d9-cd68-4b2e-b405-3a8df8776cd0	2057.49	2025-11-21	\N	\N	\N	2026-09-19 00:30:14.499388	2026-09-19 00:30:14.499388	2025-11-21	\N	f	Pix enviado: "Cp :00000000-RECEITA FEDERAL"	PAGO	\N	\N	\N
129b269e-a573-45b8-b951-08843d1352f4	1150.00	2025-12-03	\N	\N	\N	2026-09-19 00:30:14.5041	2026-09-19 00:30:14.5041	2025-12-03	\N	f	Pix enviado: "Cp :60701190-Grazielly Vieira Lima"	PAGO	\N	\N	\N
ffe00597-4532-4c19-a2fc-626af155138b	2500.00	2025-12-09	\N	\N	\N	2026-09-19 00:30:14.511101	2026-09-19 00:30:14.511101	2025-12-09	\N	f	Pix enviado: "Cp :10573521-Cleiber Nichida"	PAGO	\N	\N	\N
2393ad7d-46fd-400f-91ce-fa9332d69b8c	3500.00	2025-12-09	\N	\N	\N	2026-09-19 00:30:14.516817	2026-09-19 00:30:14.516817	2025-12-09	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N	\N	\N
87fc7ec7-2878-4e3a-867d-50cd9f8079b6	977.68	2025-12-09	\N	\N	\N	2026-09-19 00:30:14.521745	2026-09-19 00:30:14.521745	2025-12-09	\N	f	Pagamento efetuado: "Pagamento fatura cartao Inter"	PAGO	\N	\N	\N
2c52b193-47d6-442e-89f8-debb0e5f38b2	400.00	2025-12-23	\N	\N	\N	2026-09-19 00:30:14.528841	2026-09-19 00:30:14.528841	2025-12-23	\N	f	Pix enviado: "Cp :60701190-Kleber Ramos de Morais"	PAGO	\N	\N	\N
4742b71c-4516-45b3-86f4-906ed73b2b99	3500.00	2026-01-02	\N	\N	\N	2026-09-19 00:30:14.534702	2026-09-19 00:30:14.534702	2026-01-02	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N	\N	\N
cab11380-b0d9-45f8-9587-7a661eeb457f	3500.00	2026-01-02	\N	\N	\N	2026-09-19 00:30:14.540082	2026-09-19 00:30:14.540082	2026-01-02	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
753f7372-620f-4bb1-820e-a67d72b15de1	28.19	2026-01-05	\N	\N	\N	2026-09-19 00:30:14.546977	2026-09-19 00:30:14.546977	2026-01-05	\N	f	Pix enviado: "Cp :18236120-Dectra Tecnologia LTDA"	PAGO	\N	\N	\N
f8815574-1464-4ca3-bc22-67825217fde1	877.20	2026-01-05	\N	\N	\N	2026-09-19 00:30:14.552977	2026-09-19 00:30:14.552977	2026-01-05	\N	f	Pagamento efetuado: "Pagamento fatura cartao Inter"	PAGO	\N	\N	\N
e9984fca-c331-44e3-99e6-60f8af79a037	877.20	2026-01-05	\N	\N	\N	2026-09-19 00:30:14.559617	2026-09-19 00:30:14.559617	2026-01-05	\N	f	Pagamento efetuado - Fatura cart�o Inter	PAGO	\N	\N	\N
d91fcedf-3225-4160-b0d4-0994f8801a24	28.19	2026-01-05	\N	\N	\N	2026-09-19 00:30:14.567354	2026-09-19 00:30:14.567354	2026-01-05	\N	f	Pix enviado - Dectra Tecnologia Ltda	PAGO	\N	\N	\N
712e440b-3ced-4509-adf8-76c7be76f8ba	36.08	2026-01-05	\N	\N	\N	2026-09-19 00:30:14.57607	2026-09-19 00:30:14.57607	2026-01-05	\N	f	Pagamento de fatura	PAGO	\N	\N	\N
408fa7a0-f142-4128-8c23-910405c0be5c	2500.00	2026-01-09	\N	\N	\N	2026-09-19 00:30:14.584655	2026-09-19 00:30:14.584655	2026-01-09	\N	f	Pix enviado: "Cp :10573521-Cleiber Nichida"	PAGO	\N	\N	\N
441d336a-75de-44c3-950a-602feafec258	2500.00	2026-01-09	\N	\N	\N	2026-09-19 00:30:14.593152	2026-09-19 00:30:14.593152	2026-01-09	\N	f	Pix enviado - Cleiber Nichida	PAGO	\N	\N	\N
0f0b05cc-72e8-4c36-8ca9-d2226a7eb67d	2300.00	2026-01-13	\N	\N	\N	2026-09-19 00:30:14.600052	2026-09-19 00:30:14.600052	2026-01-13	\N	f	Pix enviado: "Cp :60701190-Grazielly Vieira Lima"	PAGO	\N	\N	\N
78973bf8-9c9d-430d-9240-98919ede7bb8	2300.00	2026-01-13	\N	\N	\N	2026-09-19 00:30:14.606747	2026-09-19 00:30:14.606747	2026-01-13	\N	f	Pix enviado - Grazielly Vieira Lima	PAGO	\N	\N	\N
afb9957f-3ca8-4683-b484-91fa8a9352b7	130.16	2026-01-14	\N	\N	\N	2026-09-19 00:30:14.620492	2026-09-19 00:30:14.620492	2026-01-14	\N	f	Pagamento efetuado - DEPARTAMENTO ESTADUAL DE TRANSITO	PAGO	\N	\N	\N
45f99d35-fee2-4811-bf58-d72a23c818cf	102.55	2026-01-24	\N	\N	\N	2026-09-19 00:30:14.627428	2026-09-19 00:30:14.627428	2026-01-24	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
86b8bdd4-337c-49e7-8138-b12a8e96792d	3500.00	2026-02-06	\N	\N	\N	2026-09-19 00:30:14.63491	2026-09-19 00:30:14.63491	2026-02-06	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
8bc81e67-4f85-400e-96f1-9ca4534f2a09	45.08	2026-02-08	\N	\N	\N	2026-09-19 00:30:14.641097	2026-09-19 00:30:14.641097	2026-02-08	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
995de885-5dd1-409b-bbcc-bee6941784ce	3700.00	2026-02-11	\N	\N	\N	2026-09-19 00:30:14.6481	2026-09-19 00:30:14.6481	2026-02-11	\N	f	Pix enviado - Cleiber Nichida	PAGO	\N	\N	\N
805801b4-edfe-424b-abcc-cb0486dd1b7b	1200.00	2026-02-12	\N	\N	\N	2026-09-19 00:30:14.656785	2026-09-19 00:30:14.656785	2026-02-12	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
be75a491-9e9a-4d0b-9aea-6cd6ee2b5b9a	278.64	2026-02-12	\N	\N	\N	2026-09-19 00:30:14.665096	2026-09-19 00:30:14.665096	2026-02-12	\N	f	Pix enviado - Dectra Tecnologia Ltda	PAGO	\N	\N	\N
01b44a6c-e00d-44a2-bf7b-6fa6049abe94	278.63	2026-02-12	\N	\N	\N	2026-09-19 00:30:14.672051	2026-09-19 00:30:14.672051	2026-02-12	\N	f	Pagamento de fatura	PAGO	\N	\N	\N
ab309644-4bd9-4ef5-b628-a5e5af5e51f5	800.00	2026-02-25	\N	\N	\N	2026-09-19 00:30:14.679869	2026-09-19 00:30:14.679869	2026-02-25	\N	f	Pix enviado - Kleber Ramos De Morais	PAGO	\N	\N	\N
3e0ee345-c27c-4533-9a33-66abc4c43821	4700.00	2026-03-07	\N	\N	\N	2026-09-19 00:30:14.687731	2026-09-19 00:30:14.687731	2026-03-07	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
cbf97ee0-ff37-4c07-afdb-3903688db25b	4216.48	2026-03-07	\N	\N	\N	2026-09-19 00:30:14.695379	2026-09-19 00:30:14.695379	2026-03-07	\N	f	Pix enviado - Cleiber Nichida	PAGO	\N	\N	\N
f7417d9c-f858-455d-935a-2b111036a055	153.80	2026-03-10	\N	\N	\N	2026-09-19 00:30:14.703259	2026-09-19 00:30:14.703259	2026-03-10	\N	f	Pix enviado - Dectra Tecnologia Ltda	PAGO	\N	\N	\N
cac7640e-281d-479b-aa27-33d02b14623a	153.80	2026-03-10	\N	\N	\N	2026-09-19 00:30:14.709606	2026-09-19 00:30:14.709606	2026-03-10	\N	f	Pagamento de fatura	PAGO	\N	\N	\N
869d1bff-17ba-4d0b-87dc-ce6b693ab76c	45.08	2026-04-02	\N	\N	\N	2026-09-19 00:30:14.716709	2026-09-19 00:30:14.716709	2026-04-02	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
e432a702-b064-461e-855a-ae5eac024772	4700.00	2026-04-06	\N	\N	\N	2026-09-19 00:30:14.722203	2026-09-19 00:30:14.722203	2026-04-06	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
4717fe7f-56fc-410f-9d57-eb47fbad6aa0	585.42	2026-04-08	\N	\N	\N	2026-09-19 00:30:14.728744	2026-09-19 00:30:14.728744	2026-04-08	\N	f	Pix enviado - Dectra Tecnologia Ltda	PAGO	\N	\N	\N
f9b1f150-be70-413a-bcea-8ad16cdaff22	285.40	2026-04-08	\N	\N	\N	2026-09-19 00:30:14.735084	2026-09-19 00:30:14.735084	2026-04-08	\N	f	Pagamento de fatura	PAGO	\N	\N	\N
fc8a3e73-91df-421f-9252-147e22aa6a9b	3700.00	2026-04-10	\N	\N	\N	2026-09-19 00:30:14.74048	2026-09-19 00:30:14.74048	2026-04-10	\N	f	Pix enviado - Cleiber Nichida	PAGO	\N	\N	\N
50547c6b-3cc2-423a-81a8-c9d85232a901	1350.00	2026-04-15	\N	\N	\N	2026-09-19 00:30:14.746238	2026-09-19 00:30:14.746238	2026-04-15	\N	f	Pix enviado - 65166632 Wilgner Tavares De Souza Almeida	PAGO	\N	\N	\N
75916be2-c721-4563-9c55-9ad16b9a7eda	800.00	2026-04-18	\N	\N	\N	2026-09-19 00:30:14.751436	2026-09-19 00:30:14.751436	2026-04-18	\N	f	Pix enviado - Kleber Ramos De Morais	PAGO	\N	\N	\N
cd4181d6-da86-42d9-a2ba-c115dc68c174	4700.00	2026-05-08	\N	\N	\N	2026-09-19 00:30:14.756717	2026-09-19 00:30:14.756717	2026-05-08	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
35ecc738-507a-4e40-8c3a-05446aa4a682	3700.00	2026-05-08	\N	\N	\N	2026-09-19 00:30:14.762411	2026-09-19 00:30:14.762411	2026-05-08	\N	f	Pix enviado - Cleiber Nichida	PAGO	\N	\N	\N
42acc863-41d5-4dcb-aa36-fb5aa7474d4d	207.46	2026-05-12	\N	\N	\N	2026-09-19 00:30:14.767564	2026-09-19 00:30:14.767564	2026-05-12	\N	f	Pix enviado - Nu Pagamentos Sa	PAGO	\N	\N	\N
411c68ca-62c0-4ab1-b223-5c4054172ec5	1350.00	2026-05-15	\N	\N	\N	2026-09-19 00:30:14.772535	2026-09-19 00:30:14.772535	2026-05-15	\N	f	Pix enviado - 65166632 Wilgner Tavares De Souza Almeida	PAGO	\N	\N	\N
3498685b-0dbe-4a56-aa57-be8fe893834c	400.00	2026-05-21	\N	\N	\N	2026-09-19 00:30:14.777868	2026-09-19 00:30:14.777868	2026-05-21	\N	f	Pix enviado - Kleber Ramos De Morais	PAGO	\N	\N	\N
3c1538c0-ed79-4ba9-8567-4fcf0e8b6f87	144.46	2026-05-21	\N	\N	\N	2026-09-19 00:30:14.783261	2026-09-19 00:30:14.783261	2026-05-21	\N	f	Pix enviado - Receita Federal	PAGO	\N	\N	\N
580ecb11-40df-449c-9f63-1e3b9bad5cc2	500.00	2026-05-22	\N	\N	\N	2026-09-19 00:30:14.788422	2026-09-19 00:30:14.788422	2026-05-22	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
9ce75e11-d0f9-4841-9d86-cfff85f4c2d7	1289.60	2026-05-22	\N	\N	\N	2026-09-19 00:30:14.795245	2026-09-19 00:30:14.795245	2026-05-22	\N	f	Pix enviado - Cleiber Nichida	PAGO	\N	\N	\N
0b50b9bd-5bac-4bba-b170-dfcf507b9ee4	1842.80	2026-05-30	\N	\N	\N	2026-09-19 00:30:14.800637	2026-09-19 00:30:14.800637	2026-05-30	\N	f	Pix enviado - Cleiber Nichida	PAGO	\N	\N	\N
7e9a5d5e-e08b-41f8-948d-20c498c1c3ac	13.73	2025-10-20	Impostos	\N	\N	2026-09-19 00:30:14.398897	2026-10-02 20:22:53.299453	2025-10-20	\N	f	Pix enviado: "Cp :00000000-RECEITA FEDERAL"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
bf102eb7-d0c1-448f-bc0d-9cb027a0f693	400.00	2025-10-23	Outros	\N	\N	2026-09-19 00:30:14.421403	2026-10-02 20:23:50.38161	2025-10-23	\N	f	Pix enviado: "Cp :06332931-Kleber Ramos de Morais"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
e97a3af2-84d5-4427-aed0-1b74d4150825	1150.00	2025-10-23	Folha	\N	\N	2026-09-19 00:30:14.433003	2026-10-02 20:24:02.628637	2025-10-23	\N	f	Pix enviado: "Cp :60701190-Grazielly Vieira Lima"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
98e94b86-471e-42c5-8c09-1ae17e89e295	1684.68	2025-10-26	Outros	\N	\N	2026-09-19 00:30:14.443365	2026-10-02 20:24:21.863404	2025-10-26	\N	f	Pix enviado: "Cp :60701190-DECOLAR COM LTDA"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
245d588d-56ba-4166-86a4-060256e5d182	713.15	2025-11-03	Outros	\N	\N	2026-09-19 00:30:14.455204	2026-10-02 20:24:52.791547	2025-11-03	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
2ae6638e-f3a0-46b2-85dc-68a503e9aa26	1212.97	2025-11-10	Outros	\N	\N	2026-09-19 00:30:14.468452	2026-10-02 20:25:23.112067	2025-11-10	\N	f	Pagamento efetuado: "Pagamento fatura cartao Inter"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
7cde3419-c420-4856-b2d0-8d9f7a36008c	3500.00	2025-11-11	Folha	\N	\N	2026-09-19 00:30:14.474773	2026-10-02 20:25:40.249471	2025-11-11	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
683e39eb-2034-4405-b6b0-4df50147c930	288.00	2025-11-11	Outros	\N	\N	2026-09-19 00:30:14.482038	2026-10-02 20:26:58.602296	2025-11-11	\N	f	Pix enviado: "Cp :10573521-Cleiber Nichida"	PAGO	\N	\N	DESPESA_OPERACIONAL
c73787e3-345e-42ae-ab01-98c027a9a426	400.00	2025-11-21	Outros	\N	\N	2026-09-19 00:30:14.493611	2026-10-02 20:27:33.914749	2025-11-21	\N	f	Pix enviado: "Cp :06332931-Kleber Ramos de Morais"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
96afa366-1406-4b6b-b056-9a3db0377a0a	500.00	2026-05-30	\N	\N	\N	2026-09-19 00:30:14.806413	2026-09-19 00:30:14.806413	2026-05-30	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
93716650-a1b3-45a7-955b-d51e95f40e1b	200.00	2026-06-04	\N	\N	\N	2026-09-19 00:30:14.90462	2026-09-19 00:30:14.90462	2026-06-04	\N	f	Pix enviado - Mundogeo Eventos E Consultoria Empres Lt	PAGO	\N	\N	\N
efa74ed1-b347-4730-9143-4d5e725b4e21	1171.51	2026-06-04	\N	\N	\N	2026-09-19 00:30:14.912495	2026-09-19 00:30:14.912495	2026-06-04	\N	f	Pix enviado - Zupper	PAGO	\N	\N	\N
bd405cec-7628-49ae-994a-fb5f5c7a2dba	1550.55	2026-06-05	\N	\N	\N	2026-09-19 00:30:14.919043	2026-09-19 00:30:14.919043	2026-06-05	\N	f	Pix enviado - Cleiber Nichida	PAGO	\N	\N	\N
b618372c-f0a3-4052-aa2b-6ab13b0a6463	696.00	2026-06-05	\N	\N	\N	2026-09-19 00:30:14.92451	2026-09-19 00:30:14.92451	2026-06-05	\N	f	Pix enviado - Cleiber Nichida	PAGO	\N	\N	\N
47b05cbf-fc74-4dd1-ad9d-260e20a131f7	1024.80	2026-06-08	\N	\N	\N	2026-09-19 00:30:14.931569	2026-09-19 00:30:14.931569	2026-06-08	\N	f	Pix enviado - Company Hero Ltda	PAGO	\N	\N	\N
09225a9b-335a-49ae-9a24-7a142cdc1314	3700.00	2026-06-09	\N	\N	\N	2026-09-19 00:30:14.93655	2026-09-19 00:30:14.93655	2026-06-09	\N	f	Pix enviado - Cleiber Nichida	PAGO	\N	\N	\N
2f107474-8ae4-4309-bcba-aa98a357d748	316.78	2026-06-09	\N	\N	\N	2026-09-19 00:30:14.941333	2026-09-19 00:30:14.941333	2026-06-09	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
924a6ff5-fc21-48db-be0d-334e741649bb	4700.00	2026-06-09	\N	\N	\N	2026-09-19 00:30:14.947651	2026-09-19 00:30:14.947651	2026-06-09	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
3fed5306-7b0e-4667-9de9-5822b5a1f2e9	2080.00	2026-06-09	\N	\N	\N	2026-09-19 00:30:14.952765	2026-09-19 00:30:14.952765	2026-06-09	\N	f	Pix enviado - Dectra Tecnologia Ltda	PAGO	\N	\N	\N
b693c710-bf5b-42c2-9238-9e15c4db3e99	2078.19	2026-06-09	\N	\N	\N	2026-09-19 00:30:14.957649	2026-09-19 00:30:14.957649	2026-06-09	\N	f	Pagamento de fatura	PAGO	\N	\N	\N
d98666c0-59f6-4fc2-814d-c5eff0064ea7	600.00	2026-06-11	\N	\N	\N	2026-09-19 00:30:14.963783	2026-09-19 00:30:14.963783	2026-06-11	\N	f	Pix enviado - Rhuan Messias Silva	PAGO	\N	\N	\N
fc5ad9b5-cdef-45b1-a80e-299e7fd242b5	700.00	2026-06-11	\N	\N	\N	2026-09-19 00:30:14.968958	2026-09-19 00:30:14.968958	2026-06-11	\N	f	Pix enviado - Rafael Batista De Oliveira	PAGO	\N	\N	\N
fe7cc724-fb7d-40dc-8f51-36ef293843b4	20.99	2026-06-15	\N	\N	\N	2026-09-19 00:30:14.973962	2026-09-19 00:30:14.973962	2026-06-15	\N	f	Pix enviado - Pagar Me Pagamentos	PAGO	\N	\N	\N
02635e70-6354-4b7a-a8e2-5b6bcc487d0f	1350.00	2026-06-16	\N	\N	\N	2026-09-19 00:30:14.980339	2026-09-19 00:30:14.980339	2026-06-16	\N	f	Pix enviado - 65166632 Wilgner Tavares De Souza Almeida	PAGO	\N	\N	\N
1e3f976f-af51-4f0a-bd71-75ada2f74571	400.00	2026-06-22	\N	\N	\N	2026-09-19 00:30:14.985526	2026-09-19 00:30:14.985526	2026-06-22	\N	f	Pix enviado - Kleber Ramos De Morais	PAGO	\N	\N	\N
ee602bc3-a1be-4678-b64a-33e3955e7e92	66.95	2026-06-22	\N	\N	\N	2026-09-19 00:30:14.990872	2026-09-19 00:30:14.990872	2026-06-22	\N	f	Pix enviado - Receita Federal	PAGO	\N	\N	\N
64fbed52-041b-4934-ac46-56ce7995c84e	528.38	2026-07-02	\N	\N	\N	2026-09-19 00:30:14.996901	2026-09-19 00:30:14.996901	2026-07-02	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
e784b57c-e7d9-42f6-837e-740f7ce58ea6	459.94	2026-07-02	\N	\N	\N	2026-09-19 00:30:15.001967	2026-09-19 00:30:15.001967	2026-07-02	\N	f	Pix enviado - Cleiber Nichida	PAGO	\N	\N	\N
e7735876-7091-47b1-8b80-da668e44fcf2	4700.00	2026-07-08	\N	\N	\N	2026-09-19 00:30:15.007081	2026-09-19 00:30:15.007081	2026-07-08	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
b0d5f479-d56d-40ff-a3c3-09a7c230ce24	3700.00	2026-07-08	\N	\N	\N	2026-09-19 00:30:15.013938	2026-09-19 00:30:15.013938	2026-07-08	\N	f	Pix enviado - Cleiber Nichida	PAGO	\N	\N	\N
b5ff0843-48c4-4965-9588-ba262d34fb31	1400.00	2026-07-08	\N	\N	\N	2026-09-19 00:30:15.01887	2026-09-19 00:30:15.01887	2026-07-08	\N	f	Pix enviado - Rafael Batista De Oliveira	PAGO	\N	\N	\N
98a2cf36-4c64-4b74-bbdd-2b03c4f67472	1200.00	2026-07-08	\N	\N	\N	2026-09-19 00:30:15.026277	2026-09-19 00:30:15.026277	2026-07-08	\N	f	Pix enviado - Rhuan Messias Silva	PAGO	\N	\N	\N
3fe3797a-a537-401d-8d6b-653693447838	1862.00	2026-07-08	\N	\N	\N	2026-09-19 00:30:15.032286	2026-09-19 00:30:15.032286	2026-07-08	\N	f	Pix enviado - Dectra Tecnologia Ltda	PAGO	\N	\N	\N
056290d8-729b-4d14-91c0-3ab8d988da0c	1863.17	2026-07-08	\N	\N	\N	2026-09-19 00:30:15.036867	2026-09-19 00:30:15.036867	2026-07-08	\N	f	Pagamento de fatura	PAGO	\N	\N	\N
83a21d25-26cd-4769-a55b-afff06740941	8.90	2026-07-10	\N	\N	\N	2026-09-19 00:30:15.044346	2026-09-19 00:30:15.044346	2026-07-10	\N	f	Pix enviado - Rf Tecnologia E Intermediacoes	PAGO	\N	\N	\N
f849b88d-30ff-4862-a770-d862eb7a9b72	1350.00	2026-07-16	\N	\N	\N	2026-09-19 00:30:15.056009	2026-09-19 00:30:15.056009	2026-07-16	\N	f	Pix enviado - 65166632 Wilgner Tavares De Souza Almeida	PAGO	\N	\N	\N
c360f006-eb6a-42ba-8c42-7f8c3d90f344	15.00	2026-07-28	\N	\N	\N	2026-09-19 00:30:15.06275	2026-09-19 00:30:15.06275	2026-07-28	\N	f	Pix enviado - Multidisplay Comercio E Servicos Tecnologicos Ltda	PAGO	\N	\N	\N
840c12a1-4f23-4f92-ab0b-1df65ee676a5	400.00	2026-08-04	\N	\N	\N	2026-09-19 00:30:15.068655	2026-09-19 00:30:15.068655	2026-08-04	\N	f	Pix enviado - Kleber Ramos De Morais	PAGO	\N	\N	\N
9411f868-1911-4f06-98d2-4bebf6165fa5	3700.00	2026-08-10	\N	\N	\N	2026-09-19 00:30:15.074985	2026-09-19 00:30:15.074985	2026-08-10	\N	f	Pix enviado - Cleiber Nichida	PAGO	\N	\N	\N
3bc144c6-e899-4689-be71-8004d2051cc6	4700.00	2026-08-10	\N	\N	\N	2026-09-19 00:30:15.08233	2026-09-19 00:30:15.08233	2026-08-10	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
06f2ecdf-4c1c-4643-aabf-53108b4d9c74	5268.00	2026-08-10	\N	\N	\N	2026-09-19 00:30:15.090999	2026-09-19 00:30:15.090999	2026-08-10	\N	f	Pix enviado - Dectra Tecnologia Ltda	PAGO	\N	\N	\N
31587bf9-372e-42c9-839f-7d790a9db306	1400.00	2026-08-10	\N	\N	\N	2026-09-19 00:30:15.100039	2026-09-19 00:30:15.100039	2026-08-10	\N	f	Pix enviado - Rafael Batista De Oliveira	PAGO	\N	\N	\N
82c8d9b1-5ca9-40d9-8c0a-a8ac5deabed1	1200.00	2026-08-10	\N	\N	\N	2026-09-19 00:30:15.107941	2026-09-19 00:30:15.107941	2026-08-10	\N	f	Pix enviado - Rhuan Messias Silva	PAGO	\N	\N	\N
536cf0b2-137e-4908-9484-e0cc8241fb33	5267.90	2026-08-10	\N	\N	\N	2026-09-19 00:30:15.115801	2026-09-19 00:30:15.115801	2026-08-10	\N	f	Pagamento de fatura	PAGO	\N	\N	\N
443d7608-088e-4c99-bdca-c95b2ff75d9e	1350.00	2026-08-15	\N	\N	\N	2026-09-19 00:30:15.122839	2026-09-19 00:30:15.122839	2026-08-15	\N	f	Pix enviado - 65166632 Wilgner Tavares De Souza Almeida	PAGO	\N	\N	\N
ba4ac2ab-6ce6-41d6-acb5-2bcd703535a3	775.00	2026-08-17	\N	\N	\N	2026-09-19 00:30:15.130539	2026-09-19 00:30:15.130539	2026-08-17	\N	f	Pix enviado - Oficina De Arte Bureau De Servicos Graficos Ltda	PAGO	\N	\N	\N
6bd99485-e782-411b-b429-c09e4d0bfb98	133.01	2026-08-19	\N	\N	\N	2026-09-19 00:30:15.137819	2026-09-19 00:30:15.137819	2026-08-19	\N	f	Pix enviado - Receita Federal	PAGO	\N	\N	\N
b3501531-5c06-408f-aff6-53be69fa0dfc	555.28	2026-08-19	\N	\N	\N	2026-09-19 00:30:15.145427	2026-09-19 00:30:15.145427	2026-08-19	\N	f	Pix enviado - Receita Federal	PAGO	\N	\N	\N
cd6d11fd-27e9-4328-abc6-0405737c8ba1	473.84	2026-08-19	\N	\N	\N	2026-09-19 00:30:15.152716	2026-09-19 00:30:15.152716	2026-08-19	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
1040f8cd-22ef-420e-8063-10366cf0228a	427.50	2026-08-19	\N	\N	\N	2026-09-19 00:30:15.160151	2026-09-19 00:30:15.160151	2026-08-19	\N	f	Transfer�ncia enviada pelo Pix - THIAGO LAUREANO MATOS - ���.078.881-�� - CAIXA ECONOMICA FEDERAL (0104) Ag�ncia: 6075 Conta: 3701000000583628147-1	PAGO	\N	\N	\N
98f6ecd2-6997-4570-8212-1f735b8a9b77	160.00	2026-08-20	\N	\N	\N	2026-09-19 00:30:15.167257	2026-09-19 00:30:15.167257	2026-08-20	\N	f	Pix enviado - Oficina De Arte Bureau De Servicos Graficos Ltda	PAGO	\N	\N	\N
54eed5cb-9f1e-491f-ba46-4652f908b530	400.00	2026-08-20	\N	\N	\N	2026-09-19 00:30:15.173466	2026-09-19 00:30:15.173466	2026-08-20	\N	f	Pix enviado - Kleber Ramos De Morais	PAGO	\N	\N	\N
ee9530d5-f737-4443-8062-f8cab6a1f9cf	135.00	2026-08-21	\N	\N	\N	2026-09-19 00:30:15.181723	2026-09-19 00:30:15.181723	2026-08-21	\N	f	Pix enviado - Ponto Rustico Bordados Ltda	PAGO	\N	\N	\N
d7d89ec2-12ae-4781-bf54-d708ae26c105	1277.00	2026-08-21	\N	\N	\N	2026-09-19 00:30:15.188028	2026-09-19 00:30:15.188028	2026-08-21	\N	f	Pix enviado - Oficina De Arte Bureau De Servicos Graficos Ltda	PAGO	\N	\N	\N
9b76b10c-e887-4277-a663-20021bfde6a5	331.50	2026-08-25	\N	\N	\N	2026-09-19 00:30:15.19705	2026-09-19 00:30:15.19705	2026-08-25	\N	f	Pix enviado - Hotel Monteneve Ltda	PAGO	\N	\N	\N
0dd41319-a406-4423-a84d-54c3e26d1079	64.19	2026-09-01	\N	\N	\N	2026-09-19 00:30:15.205945	2026-09-19 00:30:15.205945	2026-09-01	\N	f	Compra no d�bito - Dl *google Cloud Qsmh2sao Pablo    Bra	PAGO	\N	\N	\N
a960ce75-daed-4703-835b-53590d7935a8	209.70	2026-09-08	\N	\N	\N	2026-09-19 00:30:15.215166	2026-09-19 00:30:15.215166	2026-09-08	\N	f	Pix enviado - Cleiber Nichida	PAGO	\N	\N	\N
eaaa7136-5742-44ee-9524-afbdf0d7e959	4700.00	2026-09-08	\N	\N	\N	2026-09-19 00:30:15.223646	2026-09-19 00:30:15.223646	2026-09-08	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
53c46712-0768-4e25-8f40-223b0c78050a	3700.00	2026-09-08	\N	\N	\N	2026-09-19 00:30:15.232501	2026-09-19 00:30:15.232501	2026-09-08	\N	f	Pix enviado - Cleiber Nichida	PAGO	\N	\N	\N
f051edc0-2f68-4434-bd9e-cd7f6b233c5c	673.63	2026-09-08	\N	\N	\N	2026-09-19 00:30:15.240604	2026-09-19 00:30:15.240604	2026-09-08	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
e7735397-7b6b-4926-ab21-9ee391f78cf4	1400.00	2026-09-10	\N	\N	\N	2026-09-19 00:30:15.249301	2026-09-19 00:30:15.249301	2026-09-10	\N	f	Pix enviado - Rafael Batista De Oliveira	PAGO	\N	\N	\N
bc157340-fa1e-47c5-a98a-27f8ebc2fcf5	1200.00	2026-09-10	\N	\N	\N	2026-09-19 00:30:15.256796	2026-09-19 00:30:15.256796	2026-09-10	\N	f	Pix enviado - Rhuan Messias Silva	PAGO	\N	\N	\N
5bdd0b45-5a46-405a-b031-33c2fbca6c3f	4239.42	2026-09-10	\N	\N	\N	2026-09-19 00:30:15.264501	2026-09-19 00:30:15.264501	2026-09-10	\N	f	Pix enviado - Nu Pagamentos Sa	PAGO	\N	\N	\N
e2e405d9-696c-4e4d-ac81-a85dfbd39df3	364.14	2026-09-13	\N	\N	\N	2026-09-19 00:30:15.271279	2026-09-19 00:30:15.271279	2026-09-13	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	\N
526b0270-8f68-4b9f-bf8f-716f03b0174e	596.22	2026-09-13	Folha	\N	\N	2026-09-19 00:30:15.279856	2026-09-21 21:32:49.992638	2026-09-13	\N	f	Pix enviado - Carlos Eduardo Rocha Sousa	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
7c729af1-0e09-4a1e-a400-e86942e48c4c	875.00	2025-04-08	Folha	\N	\N	2026-09-19 00:30:13.782458	2026-09-20 22:41:36.621625	2025-04-08	\N	f	Pix enviado: "Cp :18236120-Nicole Liecheski"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
47fa2943-f75d-4ef0-a501-f6edc3627677	6895.00	2026-07-15	Marketing	\N	\N	2026-09-19 00:30:15.049973	2026-09-21 21:26:25.441166	2026-07-15	\N	f	Pagamento efetuado - ARANDA EVENTOS CONGRESSOS LTDA	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
e0ebcc0c-2d4a-478c-b0c0-d54a1eecae4f	960.00	2024-06-13	Aluguel	\N	\N	2026-09-19 00:30:13.669768	2026-09-21 21:33:12.699897	2024-06-13	\N	f	Pix enviado: "Cp :15111975-COMPANY HERO LTDA"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
76efedc1-f9ae-4d66-9641-8b861f4938cd	9347.58	2025-04-22	Fornecedores	\N	\N	2026-09-19 00:30:13.795697	2026-09-22 14:08:17.76587	2025-04-22	\N	f	Pix enviado: "Cp :60701190-Grupo Sigma Engenharia"	PAGO	\N	\N	DESPESA_OPERACIONAL
e0337dcc-6644-4532-a498-a4a7f5e08b18	120.84	2025-07-17	Outros	\N	\N	2026-09-19 00:30:14.02715	2026-09-22 14:39:47.650366	2025-07-17	\N	f	Pix enviado: "Cp :10573521-Cleiber Nichida"	PAGO	\N	e6487940-e1ee-478e-b9cb-32655d0c40c4	DESPESA_OPERACIONAL
326895ad-e8d7-4565-926f-2b603db5af5f	875.00	2025-06-10	Folha	\N	\N	2026-09-19 00:30:13.92444	2026-09-24 22:59:49.400786	2025-06-10	\N	f	Pix enviado: "Cp :18236120-Nicole Liecheski"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
43fa0e23-071e-4fed-a670-4e9ad555dbde	238.56	2025-07-17	Outros	\N	\N	2026-09-19 00:30:14.010451	2026-09-24 23:04:56.187988	2025-07-17	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N	\N	DESPESA_OPERACIONAL
2da0dc44-b4f5-401d-ba19-d8702b177e13	129.70	2025-07-31	Impostos	\N	\N	2026-09-19 00:30:14.096322	2026-09-24 23:08:47.497312	2025-07-31	\N	f	Pix enviado: "Cp :60701190-GOIANIA PREFEITURA MUNICIPAL GABINETE DO PREFEITO"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
8bf86052-1511-484f-9b86-178e927a8c1b	1150.00	2025-08-27	Folha	\N	\N	2026-09-19 00:30:14.168332	2026-10-02 17:59:33.510577	2025-08-27	\N	f	Pix enviado: "Cp :60701190-Grazielly Vieira Lima"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
fc99bca7-2de8-423b-baf0-d17780339e87	73.10	2025-09-12	Outros	\N	\N	2026-09-19 00:30:14.224777	2026-10-02 18:02:40.01001	2025-09-12	\N	f	Pagamento efetuado: "Pagamento fatura cartao Inter"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
e29843d7-7d60-4240-b469-5d661a3cfcf3	1350.00	2026-09-15	Marketing	\N	\N	2026-09-19 00:30:15.287592	2026-10-02 20:08:11.780506	2026-09-15	\N	f	Pix enviado - 65166632 Wilgner Tavares De Souza Almeida	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
e2009d3e-e932-46e5-9306-c347bf85ba5a	1849.03	2025-09-24	Folha	\N	\N	2026-09-19 00:30:14.283458	2026-10-02 20:12:43.109402	2025-09-24	\N	f	Pix enviado: "Cp :18236120-Carlos Eduardo Rocha Sousa"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
4e8f3ddd-3a18-4c51-bf2c-5a8a5d509a58	40.85	2025-10-01	Fornecedores	\N	\N	2026-09-19 00:30:14.318246	2026-10-02 20:18:20.452015	2025-10-01	\N	f	Compra no debito: "No estabelecimento DL *GOOGLE CLOUD Rvw3P Sao Pablo BRA"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
08d36e58-05e4-4fdb-b1d9-fa3614f13f2a	2500.00	2025-11-11	Folha	\N	\N	2026-09-19 00:30:14.486878	2026-10-02 20:27:14.782011	2025-11-11	\N	f	Pix enviado: "Cp :10573521-Cleiber Nichida"	PAGO	\N	\N	DESPESA_ADMINISTRATIVA
46f2b5d6-9bba-4d48-a39a-357a4dd4e993	118.20	2026-10-05	Outros	Gerado automaticamente a partir da despesa ID: 86dc61f6-dd89-410b-b67a-5bd2ec8303d0	\N	2026-10-02 22:04:06.332414	2026-10-02 22:04:06.332414	\N	86dc61f6-dd89-410b-b67a-5bd2ec8303d0	f	Claude	PENDENTE	\N	\N	\N
faff1cde-b6a2-41d5-8fcb-53995573e670	400.00	2026-10-14	Outros	Gerado automaticamente pelo sistema (Recorrência)	b7a3a410-e2fa-4c51-bfd8-c589c76ef737	2026-10-05 09:52:12.108728	2026-10-05 09:52:12.108728	\N	\N	f	Contador	PENDENTE	\N	\N	\N
01394c6b-59bd-4972-80bd-2e2d5a493b6b	8.90	2026-10-30	Outros	Gerado automaticamente pelo sistema (Recorrência)	aa473fd4-f328-4a86-a9e2-d22a1aaf5eae	2026-10-05 09:52:14.05644	2026-10-05 09:52:14.05644	\N	\N	f	Emissor de NFE	PENDENTE	\N	\N	\N
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
cb58a509-293a-4430-a711-94359f58d8bf	Boleto de cobranca recebido: "112/90496759476"	11430.45	0.00	2025-12-22	2025-12-22	RECEBIDO	2026-09-19 00:30:14.15107	2026-09-19 00:30:14.15107	\N	\N	\N
cb2abde3-d62b-4e6e-a44d-e9d783e66562	Transfer�ncia recebida pelo Pix - DECTRA INOVA SIMPLES - 53.450.778/0001-69 - BANCO INTER (0077) Ag�ncia: 1 Conta: 36270276-4	28.19	0.00	2026-01-05	2026-01-05	RECEBIDO	2026-09-19 00:30:14.16336	2026-09-19 00:30:14.16336	\N	\N	\N
58fcb5f8-25ce-40ed-a37c-0e14477889e7	Boleto de cobranca recebido: "112/90564546078"	11430.45	0.00	2026-01-12	2026-01-12	RECEBIDO	2026-09-19 00:30:14.174477	2026-09-19 00:30:14.174477	\N	\N	\N
1b925181-607d-49ed-a2e4-4eb5b933b985	Boleto de cobran�a recebido - Gali LTDA	11430.45	0.00	2026-01-12	2026-01-12	RECEBIDO	2026-09-19 00:30:14.188452	2026-09-19 00:30:14.188452	\N	\N	\N
4c64fbbb-3e28-4ffe-a81c-c621affb69f7	Transfer�ncia recebida pelo Pix - DECTRA INOVA SIMPLES - 53.450.778/0001-69 - BANCO INTER (0077) Ag�ncia: 1 Conta: 36270276-4	278.64	0.00	2026-02-12	2026-02-12	RECEBIDO	2026-09-19 00:30:14.199428	2026-09-19 00:30:14.199428	\N	\N	\N
f3993857-8584-4137-ae52-458e70a666b1	Transfer�ncia recebida pelo Pix - DECTRA INOVA SIMPLES - 53.450.778/0001-69 - BANCO INTER (0077) Ag�ncia: 1 Conta: 36270276-4	153.80	0.00	2026-03-10	2026-03-10	RECEBIDO	2026-09-19 00:30:14.21016	2026-09-19 00:30:14.21016	\N	\N	\N
dffe66dc-dc0c-4544-9843-84eafb1b89e9	Pix recebido - Nucleo De Gestao Do Porto Digital	100000.00	0.00	2026-03-26	2026-03-26	RECEBIDO	2026-09-19 00:30:14.219278	2026-09-19 00:30:14.219278	\N	\N	\N
1ea1d543-2bf7-4236-8542-dffe06fae7f4	Cr�dito domic�lio cart�o - Cart�o De Cr�dito - Stripe	1.50	0.00	2026-03-30	2026-03-30	RECEBIDO	2026-09-19 00:30:14.230465	2026-09-19 00:30:14.230465	\N	\N	\N
e9980c7c-ca67-49c7-8a87-64fb37b63c6d	Transfer�ncia recebida pelo Pix - DECTRA INOVA SIMPLES - 53.450.778/0001-69 - BANCO INTER (0077) Ag�ncia: 1 Conta: 36270276-4	585.42	0.00	2026-04-08	2026-04-08	RECEBIDO	2026-09-19 00:30:14.240539	2026-09-19 00:30:14.240539	\N	\N	\N
d7fde28a-4df8-4188-a003-a51c03e7f1f1	Boleto de cobran�a recebido - Voltax Energia e Com�rcio LTDA	1200.00	0.00	2026-05-13	2026-05-13	RECEBIDO	2026-09-19 00:30:14.25259	2026-09-19 00:30:14.25259	\N	\N	\N
76140845-a90c-495a-883e-83d5c0c76177	Boleto de cobran�a recebido - NORR ENGENHARIA E ENERGIA LTDA	1080.00	0.00	2026-05-29	2026-05-29	RECEBIDO	2026-09-19 00:30:14.265187	2026-09-19 00:30:14.265187	\N	\N	\N
6a146e0d-e4c3-4197-ba2a-373bca1031d8	Pix recebido - Norr Engenharia E Energia Ltda	1116.00	0.00	2026-06-09	2026-06-09	RECEBIDO	2026-09-19 00:30:14.276658	2026-09-19 00:30:14.276658	\N	\N	\N
205d61f7-5eb4-4751-adf7-6c780d5cea55	Transfer�ncia recebida pelo Pix - DECTRA INOVA SIMPLES - 53.450.778/0001-69 - BANCO INTER (0077) Ag�ncia: 1 Conta: 36270276-4	2080.00	0.00	2026-06-09	2026-06-09	RECEBIDO	2026-09-19 00:30:14.288527	2026-09-19 00:30:14.288527	\N	\N	\N
3f343071-3441-460a-9f00-00cc0a0ed61d	Pix recebido - Nucleo De Gestao Do Porto Digi	100000.00	0.00	2026-06-26	2026-06-26	RECEBIDO	2026-09-19 00:30:14.300855	2026-09-19 00:30:14.300855	\N	\N	\N
52d82077-6244-4b28-b559-e828d47d3a26	Boleto de cobran�a recebido - NORR ENGENHARIA E ENERGIA LTDA	6587.60	0.00	2026-06-26	2026-06-26	RECEBIDO	2026-09-19 00:30:14.312049	2026-09-19 00:30:14.312049	\N	\N	\N
388fff82-cae8-4b7f-b368-e7a84e1b5cbf	Boleto de cobran�a recebido - NORR ENGENHARIA E ENERGIA LTDA	1292.00	0.00	2026-06-26	2026-06-26	RECEBIDO	2026-09-19 00:30:14.323729	2026-09-19 00:30:14.323729	\N	\N	\N
ad2a9351-9504-47c6-b147-be2ae24c5167	Boleto de cobran�a recebido - NORR ENGENHARIA E ENERGIA LTDA	440.80	0.00	2026-06-30	2026-06-30	RECEBIDO	2026-09-19 00:30:14.335238	2026-09-19 00:30:14.335238	\N	\N	\N
bc90d3f3-f396-4a6d-8e58-e261267369ed	Transfer�ncia recebida pelo Pix - DECTRA INOVA SIMPLES - 53.450.778/0001-69 - BANCO INTER (0077) Ag�ncia: 1 Conta: 36270276-4	1862.00	0.00	2026-07-08	2026-07-08	RECEBIDO	2026-09-19 00:30:14.347242	2026-09-19 00:30:14.347242	\N	\N	\N
3a47c8db-92f7-4b43-8643-d7814765e486	Transferencia recebida: "237 3684 34193 BC GERACAO E GESTAO DE ATIVOS DE EN"	25423.63	0.00	2025-07-03	2025-07-03	RECEBIDO	2026-09-19 00:30:13.933057	2026-09-24 23:00:41.807032	Serviços	RECEITA_OPERACIONAL	13210761-d111-47f7-8497-96c9acb21b1e
9e94f7b9-cb38-4122-9033-520060716752	Pix recebido: "Cp :60701190-SIGMA SOLUCOES EM ENERGIA LTDA"	6232.61	0.00	2025-04-04	2025-04-04	RECEBIDO	2026-09-19 00:30:13.762923	2026-09-23 11:54:07.18777	Serviços	RECEITA_OPERACIONAL	1880bb8f-3b49-4dd0-9be7-b2aa15fbcd02
619e3733-b597-4bff-989a-d4cf112135b0	Pix recebido: "00019 0007469330 RICARDO ALVES"	320.00	0.00	2024-06-13	2024-06-13	RECEBIDO	2026-09-19 00:30:13.696174	2026-09-21 21:28:13.277381	Outros	RECEITA_EXTRAORDINARIA	\N
c34a2405-020e-466b-8f98-95c115ce5797	Pix recebido: "Cp :18236120-Carlos Eduardo Rocha Sousa"	320.00	0.00	2024-06-13	2024-06-13	RECEBIDO	2026-09-19 00:30:13.602493	2026-09-21 21:28:22.906042	Outros	RECEITA_EXTRAORDINARIA	\N
9fb932a4-d21f-40d2-9c0e-a41bd3a4ab86	Pix recebido: "Cp :04388688-SIGMA SOLUCOES EM ENERGIA LTDA"	4116.00	0.00	2024-09-12	2024-09-12	RECEBIDO	2026-09-19 00:30:13.724406	2026-09-22 12:57:00.182387	Serviços	RECEITA_EXTRAORDINARIA	c6554c41-9341-4cd0-8620-782329e8b0f6
25dd809f-847e-4380-92a0-43cb3c8444b7	Transferencia recebida: "237 3684 34193 BC GERACAO E GESTAO DE ATIVOS DE EN"	29955.88	0.00	2025-04-14	2025-04-14	RECEBIDO	2026-09-19 00:30:13.787852	2026-09-22 13:51:51.706842	Serviços	RECEITA_OPERACIONAL	e6487940-e1ee-478e-b9cb-32655d0c40c4
eeaf9df0-c998-491e-9211-e41a965c2fe5	Transferencia recebida: "237 3684 34193 BC GERACAO E GESTAO DE ATIVOS DE EN"	7858.76	0.00	2025-04-14	2025-04-14	RECEBIDO	2026-09-19 00:30:13.802682	2026-09-22 14:03:59.700319	Serviços	RECEITA_OPERACIONAL	1880bb8f-3b49-4dd0-9be7-b2aa15fbcd02
116d295c-2d8b-4f13-a99b-8015dfaea13a	Pix recebido: "Cp :60701190-SIGMA SOLUCOES EM ENERGIA LTDA"	16688.90	0.00	2025-04-17	2025-04-17	RECEBIDO	2026-09-19 00:30:13.819946	2026-09-22 14:07:32.513335	Serviços	RECEITA_OPERACIONAL	359b141c-3ef2-4359-b613-7839c480bdb2
ba919206-fc2d-4494-8be0-d4e5f5b9369b	Pix recebido: "00019 7469330 RICARDO ALVES"	1000.00	0.00	2025-05-08	2025-05-08	RECEBIDO	2026-09-19 00:30:13.852684	2026-09-22 14:10:59.708064	Editais	RECEITA_EXTRAORDINARIA	\N
f959cf61-3741-47de-ab20-87e74ed8ed4a	Pix recebido: "Cp :18236120-Carlos Eduardo Rocha Sousa"	0.13	0.00	2025-05-21	2025-05-21	RECEBIDO	2026-09-19 00:30:13.883685	2026-09-22 14:41:04.215576	Editais	RECEITA_EXTRAORDINARIA	\N
a85678cc-ca2f-4716-aa5c-9b3db21e933c	Transferencia recebida: "237 3684 34193 BC GERACAO E GESTAO DE ATIVOS DE EN"	14073.33	0.00	2025-07-03	2025-07-03	RECEBIDO	2026-09-19 00:30:13.901063	2026-09-22 14:50:18.691758	Serviços	RECEITA_OPERACIONAL	0580da98-97d1-4860-ad75-2071312fbd44
35721d4b-86e2-496d-9420-0a1b4aac7115	Transferencia recebida: "237 3684 34193 BC GERACAO E GESTAO DE ATIVOS DE EN"	8427.10	0.00	2025-07-03	2025-07-03	RECEBIDO	2026-09-19 00:30:13.949039	2026-09-22 14:54:20.354843	Serviços	RECEITA_OPERACIONAL	1332383d-073f-4474-b96a-09ea27a5a7ac
c4653030-ccf4-4f3d-81cf-a2ee9e2e881b	Pix recebido: "Cp :60701190-SIGMA SOLUCOES EM ENERGIA LTDA"	3271.40	0.00	2025-04-17	2025-04-17	RECEBIDO	2026-09-19 00:30:13.836927	2026-09-23 11:21:05.984222	Serviços	RECEITA_OPERACIONAL	e2152271-07d4-4def-bd99-99949beecd4d
921addc1-7aa1-4b8c-a482-ec1bde0b42f4	Pix recebido: "Cp :60701190-NUCLEO DE GESTAO DO PORTO DIGITAL"	10000.00	0.00	2024-08-08	2024-08-08	RECEBIDO	2026-09-19 00:30:13.71144	2026-09-23 11:23:14.452337	Editais	RECEITA_EXTRAORDINARIA	\N
47c07e34-7c74-4907-9a94-62b9715e962e	Transferencia recebida: "237 3684 34193 BC GERACAO E GESTAO DE ATIVOS DE EN"	5295.24	0.00	2025-07-03	2025-07-03	RECEBIDO	2026-09-19 00:30:13.981956	2026-09-24 23:02:08.11133	Serviços	RECEITA_OPERACIONAL	cbfd13c7-eee5-4cb9-a067-b54c39774099
b2c5bc52-f06c-459a-aa47-578ca388a46c	Transferencia recebida: "237 3684 34193 BC GERACAO E GESTAO DE ATIVOS DE EN"	13785.00	0.00	2025-07-03	2025-07-03	RECEBIDO	2026-09-19 00:30:13.999726	2026-09-24 23:02:32.872024	Serviços	RECEITA_OPERACIONAL	4bf0f050-1cdd-48c3-807f-49c74f7bfe1e
2b741dd9-1a92-49f0-a331-85e8c56211f0	Transferencia recebida: "237 3684 34193 BC GERACAO E GESTAO DE ATIVOS DE EN"	3710.35	0.00	2025-07-03	2025-07-03	RECEBIDO	2026-09-19 00:30:14.019056	2026-09-24 23:03:01.479771	Serviços	RECEITA_OPERACIONAL	85d8d39a-f835-4e8f-9492-41c6310c5fa5
9d196f47-3a73-4ba1-9f01-19d17e321151	Boleto de cobranca recebido: "112/90368510452"	1282.16	0.00	2025-08-25	2025-08-25	RECEBIDO	2026-09-19 00:30:14.06485	2026-10-02 17:58:08.822236	Serviços	RECEITA_OPERACIONAL	f0c13842-f99e-44bd-9ab9-880efa3f274d
4d445028-e52e-43b5-a5ae-57f81cd0effd	Boleto de cobranca recebido: "112/90429405486"	450.00	0.00	2025-09-10	2025-09-10	RECEBIDO	2026-09-19 00:30:14.089389	2026-10-02 18:01:22.833833	Serviços	RECEITA_OPERACIONAL	a6a4d8cc-41b9-4fdd-a5a0-ca84c063d07c
2445e6f7-cc97-47bf-b010-5db368841b8b	Boleto de cobranca recebido: "112/90369973014"	2325.87	0.00	2025-08-25	2025-08-25	RECEBIDO	2026-09-19 00:30:14.07729	2026-10-02 17:57:30.869192	Serviços	RECEITA_OPERACIONAL	5b4a6de4-0830-478e-8fa4-6a40f0fe35e5
93ddeaae-f614-4e5b-ab6d-078d4bfc4160	Boleto de cobranca recebido: "112/90368510437"	1282.16	0.00	2025-07-25	2025-07-25	RECEBIDO	2026-09-19 00:30:14.03579	2026-10-02 17:57:46.923811	Serviços	RECEITA_OPERACIONAL	f0c13842-f99e-44bd-9ab9-880efa3f274d
de1c6e2e-c7c2-4e21-957e-83d6b22eeaeb	Boleto de cobranca recebido: "112/90414567548"	1250.00	0.00	2025-09-29	2025-09-29	RECEBIDO	2026-09-19 00:30:14.130609	2026-10-02 20:12:07.018636	Serviços	RECEITA_OPERACIONAL	ff4a2864-1600-4548-9a6e-dffa0a9ebf90
cf438eec-b06e-4bab-9cce-ae890220ed13	Boleto de cobranca recebido: "112/90368510460"	1282.16	0.00	2025-09-25	2025-09-25	RECEBIDO	2026-09-19 00:30:14.102811	2026-10-02 20:13:19.564348	Serviços	RECEITA_OPERACIONAL	f0c13842-f99e-44bd-9ab9-880efa3f274d
390deb42-dc5f-4bec-8c35-51ef90cdf9ba	Transfer�ncia recebida - Voltax Engenharia Industria E	1781.46	0.00	2026-07-13	2026-07-13	RECEBIDO	2026-09-19 00:30:14.359039	2026-09-19 00:30:14.359039	\N	\N	\N
864d2fc9-7570-414b-8476-108d8c62fe37	Boleto de cobran�a recebido - POLIFERTIL UFV MATO GROSSO DO SUL 1 EQUIPAMENTOS FOTOVOLTAICOS LTDA	1008.00	0.00	2026-07-30	2026-07-30	RECEBIDO	2026-09-19 00:30:14.370398	2026-09-19 00:30:14.370398	\N	\N	\N
aaeb99ee-e75f-4468-b21f-5fadc347f056	Transfer�ncia recebida pelo Pix - DECTRA INOVA SIMPLES - 53.450.778/0001-69 - BANCO INTER (0077) Ag�ncia: 1 Conta: 36270276-4	5268.00	0.00	2026-08-10	2026-08-10	RECEBIDO	2026-09-19 00:30:14.382632	2026-09-19 00:30:14.382632	\N	\N	\N
6d432c2e-c172-4ee8-9f92-f95394eb3ce4	Cr�dito domic�lio cart�o - Cart�o De Cr�dito - Stripe	24.00	0.00	2026-08-12	2026-08-12	RECEBIDO	2026-09-19 00:30:14.393145	2026-09-19 00:30:14.393145	\N	\N	\N
d76d2b11-0302-48a6-8f04-c542dd4b3c67	Cr�dito domic�lio cart�o - Cart�o De Cr�dito - Stripe	75.00	0.00	2026-08-17	2026-08-17	RECEBIDO	2026-09-19 00:30:14.404292	2026-09-19 00:30:14.404292	\N	\N	\N
290afd36-38c2-4597-a4cf-094bd18fb83d	Pix recebido - Jorge Augusto Lobo Caldeira	500.00	0.00	2026-08-17	2026-08-17	RECEBIDO	2026-09-19 00:30:14.416639	2026-09-19 00:30:14.416639	\N	\N	\N
c159593e-3db6-46b3-a11b-f13a521fadc7	Valor adicionado na conta por cart�o de cr�dito - Valor adicionado para Pix no Cr�dito	427.50	0.00	2026-08-19	2026-08-19	RECEBIDO	2026-09-19 00:30:14.427404	2026-09-19 00:30:14.427404	\N	\N	\N
0e0bbce6-4db4-43ef-b3ce-1683e958b192	Pix recebido - Enertek Solucoes	1890.00	0.00	2026-08-20	2026-08-20	RECEBIDO	2026-09-19 00:30:14.437727	2026-09-19 00:30:14.437727	\N	\N	\N
ea6f19dc-964a-4cbb-adf8-6887d301bf73	Cr�dito domic�lio cart�o - Cart�o De Cr�dito - Stripe	27.00	0.00	2026-08-31	2026-08-31	RECEBIDO	2026-09-19 00:30:14.449438	2026-09-19 00:30:14.449438	\N	\N	\N
b6f21b9a-8267-4d21-b240-6612f347a9a1	Cr�dito domic�lio cart�o - Cart�o De Cr�dito - Stripe	1.25	0.00	2026-09-04	2026-09-04	RECEBIDO	2026-09-19 00:30:14.461498	2026-09-19 00:30:14.461498	\N	\N	\N
b00e5a72-41ef-4a84-9427-5b0829420e5e	Pix recebido: "Cp :90400888-RICARDO HENRIQUE FONSECA ALVES"	2000.00	0.00	2025-04-07	2025-04-07	RECEBIDO	2026-09-19 00:30:13.775355	2026-09-20 22:41:52.658289	Outros	RECEITA_EXTRAORDINARIA	\N
51ed8017-5e2b-49e9-9682-6abef7f0f95d	Pix recebido: "Cp :00000000-CARLOS R SILVEIRA JR"	320.00	0.00	2024-06-13	2024-06-13	RECEBIDO	2026-09-19 00:30:13.677895	2026-09-21 21:27:59.937681	Projetos	RECEITA_EXTRAORDINARIA	\N
92a36f65-202a-4e5b-b432-24a56edd3ec2	Pix recebido: "Cp :04388688-SIGMA SOLUCOES EM ENERGIA LTDA"	3446.70	0.00	2025-02-17	2025-02-17	RECEBIDO	2026-09-19 00:30:13.746692	2026-09-22 14:05:20.809881	Serviços	RECEITA_OPERACIONAL	e2152271-07d4-4def-bd99-99949beecd4d
8d0c6069-5fbd-46fc-8cdc-1aac652aa998	Pix recebido: "Cp :00000000-RICARDO HENRIQUE FONSECA ALVES"	1000.00	0.00	2025-05-08	2025-05-08	RECEBIDO	2026-09-19 00:30:13.868208	2026-09-22 14:40:44.228482	Editais	RECEITA_EXTRAORDINARIA	\N
89c01a69-16ae-4cc8-974e-6694398145c5	Transferencia recebida: "237 3684 34193 BC GERACAO E GESTAO DE ATIVOS DE EN"	1686.35	0.00	2025-07-03	2025-07-03	RECEBIDO	2026-09-19 00:30:13.916962	2026-09-22 14:50:54.704839	Serviços	RECEITA_OPERACIONAL	2e9f93dc-15c0-430d-9c39-9ef34736a729
c0cc5e01-40e0-4146-a308-811e8b32d287	Transferencia recebida: "237 3684 34193 BC GERACAO E GESTAO DE ATIVOS DE EN"	7046.75	0.00	2025-07-03	2025-07-03	RECEBIDO	2026-09-19 00:30:13.965743	2026-09-24 23:01:32.937508	Serviços	RECEITA_OPERACIONAL	45008448-f22a-4041-9409-f6bef64ab65e
45ddefd5-c6e6-4d99-b886-0e3ef81a2a7e	Boleto de cobranca recebido: "112/90369973006"	2325.87	0.00	2025-07-25	2025-07-25	RECEBIDO	2026-09-19 00:30:14.051086	2026-09-24 23:08:31.108495	Serviços	RECEITA_OPERACIONAL	5b4a6de4-0830-478e-8fa4-6a40f0fe35e5
d33518b1-f9f5-4a09-94b7-70c9e4c7a458	Boleto de cobranca recebido: "112/90496751747"	11430.45	0.00	2025-12-01	2025-12-01	RECEBIDO	2026-09-19 00:30:14.141078	2026-10-02 20:08:43.320928	Serviços	RECEITA_OPERACIONAL	ea45a395-136d-4766-b95f-72c4a897597a
e46522c7-1647-459e-b3a0-1ea240cb7dec	Boleto de cobranca recebido: "112/90369973022"	2325.86	0.00	2025-09-25	2025-09-25	RECEBIDO	2026-09-19 00:30:14.115471	2026-10-02 20:16:37.20776	Serviços	RECEITA_OPERACIONAL	5b4a6de4-0830-478e-8fa4-6a40f0fe35e5
\.


--
-- Data for Name: recurring_expenses; Type: TABLE DATA; Schema: public; Owner: dectra
--

COPY public.recurring_expenses (id, description, category, "estimatedAmount", "dueDay", status, notes, "lastGenerated", "createdAt", "updatedAt", "generatesReceipt", "autoConfirmOnDueDate") FROM stdin;
338a8ac1-1fe3-4604-a560-34bf188dd47d	IWILL design	Outros	1350.00	14	ATIVO	\N	2026-10-15	2026-10-02 20:41:52.616873	2026-10-02 20:41:52.616873	f	f
46a817bf-b566-4094-8619-cbeae43b0236	Google Drive	Outros	45.90	14	ATIVO	\N	2026-10-15	2026-10-02 20:43:39.117689	2026-10-02 20:43:39.117689	f	f
286945b1-7b3c-428f-9eae-676c32960335	Google Workspace	Outros	49.90	4	ATIVO	\N	2026-10-05	2026-10-02 22:02:35.594546	2026-10-02 22:02:35.594546	f	f
18ecf5b4-5274-4712-a256-a44ca0f5f5af	Google Colab	Outros	58.00	4	ATIVO	\N	2026-10-05	2026-10-02 22:03:11.445203	2026-10-02 22:03:11.445203	f	f
1057f278-2459-483f-b31d-bd5ed335a1f2	Canva Pro	Outros	35.00	4	ATIVO	\N	2026-10-05	2026-10-02 22:03:37.250683	2026-10-02 22:03:37.250683	f	f
19832242-1c95-4f0d-88df-40c74c882253	Chat GPT	Outros	107.52	4	ATIVO	\N	2026-10-05	2026-10-02 22:05:34.522403	2026-10-02 22:05:34.522403	f	f
b7a3a410-e2fa-4c51-bfd8-c589c76ef737	Contador	Outros	400.00	14	ATIVO	\N	2026-10-14	2026-09-24 22:58:58.903273	2026-10-05 09:52:13.234644	f	f
aa473fd4-f328-4a86-a9e2-d22a1aaf5eae	Emissor de NFE	Outros	8.90	30	ATIVO	\N	2026-10-30	2026-10-02 22:06:36.23338	2026-10-05 09:52:14.156921	f	f
07021521-21b9-4163-b250-8d1ac28649f8	Pró-Labore Carlos Rocha	Outros	4700.00	8	ATIVO	\N	2026-10-09	2026-10-05 10:18:17.4469	2026-10-05 10:18:17.4469	f	f
70e11240-eda6-4002-b4aa-3e47a73c29a8	Pró-Labore Cleiber Nichida	Outros	4300.00	8	ATIVO	\N	2026-10-09	2026-10-05 10:19:13.004769	2026-10-05 10:19:13.004769	f	f
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

\unrestrict mAq7H8wb70bFikVp7JQsXRGhr1FYcPKQjLyS1CccN12eiy0iuCvCw8lFl9p3dW3

