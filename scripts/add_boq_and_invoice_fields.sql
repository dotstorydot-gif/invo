-- 1. ADD CONSTRUCTION INVOICE FIELDS TO SALES INVOICES
ALTER TABLE public.sales_invoices
ADD COLUMN IF NOT EXISTS boq_reference TEXT,
    ADD COLUMN IF NOT EXISTS work_description TEXT,
    ADD COLUMN IF NOT EXISTS quantity NUMERIC DEFAULT 1,
    ADD COLUMN IF NOT EXISTS unit_price NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS vat_percentage NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS retention_percentage NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS payment_terms TEXT;
-- 2. ENHANCE INVENTORY TABLE
ALTER TABLE public.inventory
ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS unit TEXT,
    ADD COLUMN IF NOT EXISTS stock_threshold NUMERIC DEFAULT 10,
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'In Stock',
    ADD COLUMN IF NOT EXISTS supplier TEXT,
    ADD COLUMN IF NOT EXISTS last_restocked DATE DEFAULT CURRENT_DATE;
-- 3. SEED BOQ ITEMS INTO INVENTORY FOR ALL EXISTING ORGANIZATIONS
DO $$
DECLARE org_record RECORD;
BEGIN FOR org_record IN
SELECT id
FROM public.organizations LOOP -- Insert Pre-defined BOQ Project Tasks/Materials
INSERT INTO public.inventory (
        organization_id,
        name,
        description,
        code,
        unit,
        cost_price,
        quantity,
        status
    )
SELECT org_record.id,
    item.name,
    item.description,
    item.code,
    item.unit,
    0,
    0,
    'In Stock'
FROM (
        VALUES (
                'Site mobilization & temporary works',
                '1️⃣ PRELIMINARIES',
                '1.1',
                'LS'
            ),
            (
                'Site fencing & safety signage',
                '1️⃣ PRELIMINARIES',
                '1.2',
                'LS'
            ),
            (
                'Setting out works',
                '1️⃣ PRELIMINARIES',
                '1.3',
                'LS'
            ),
            (
                'Temporary utilities',
                '1️⃣ PRELIMINARIES',
                '1.4',
                'LS'
            ),
            (
                'Excavation for foundations',
                '2️⃣ EARTHWORKS',
                '2.1',
                'm3'
            ),
            (
                'Backfilling & compaction',
                '2️⃣ EARTHWORKS',
                '2.2',
                'm3'
            ),
            (
                'Sand filling under raft',
                '2️⃣ EARTHWORKS',
                '2.3',
                'm3'
            ),
            (
                'Plain cement concrete (PCC)',
                '3️⃣ CONCRETE WORKS',
                '3.1',
                'm3'
            ),
            (
                'Reinforced concrete raft',
                '3️⃣ CONCRETE WORKS',
                '3.2',
                'm3'
            ),
            (
                'Reinforced concrete columns',
                '3️⃣ CONCRETE WORKS',
                '3.3',
                'm3'
            ),
            (
                'Reinforced concrete slabs',
                '3️⃣ CONCRETE WORKS',
                '3.4',
                'm3'
            ),
            (
                'Reinforced concrete beams',
                '3️⃣ CONCRETE WORKS',
                '3.5',
                'm3'
            ),
            (
                'Steel reinforcement',
                '3️⃣ CONCRETE WORKS',
                '3.6',
                'ton'
            ),
            (
                'Red brick walls (external)',
                '4️⃣ MASONRY WORKS',
                '4.1',
                'm2'
            ),
            (
                'Hollow block walls (internal)',
                '4️⃣ MASONRY WORKS',
                '4.2',
                'm2'
            ),
            (
                'Internal plaster',
                '5️⃣ PLASTER & FINISHING',
                '5.1',
                'm2'
            ),
            (
                'External plaster',
                '5️⃣ PLASTER & FINISHING',
                '5.2',
                'm2'
            ),
            (
                'Paint (internal)',
                '5️⃣ PLASTER & FINISHING',
                '5.3',
                'm2'
            ),
            (
                'Paint (external weather coat)',
                '5️⃣ PLASTER & FINISHING',
                '5.4',
                'm2'
            ),
            (
                'Ceramic floor tiles',
                '5️⃣ PLASTER & FINISHING',
                '5.5',
                'm2'
            ),
            (
                'Marble for stairs',
                '5️⃣ PLASTER & FINISHING',
                '5.6',
                'm2'
            ),
            (
                'Gypsum board ceilings',
                '5️⃣ PLASTER & FINISHING',
                '5.7',
                'm2'
            ),
            (
                'Wooden doors',
                '6️⃣ DOORS & WINDOWS',
                '6.1',
                'No.'
            ),
            (
                'Aluminum windows',
                '6️⃣ DOORS & WINDOWS',
                '6.2',
                'm2'
            ),
            (
                'Main steel entrance door',
                '6️⃣ DOORS & WINDOWS',
                '6.3',
                'No.'
            ),
            (
                'Electrical wiring & conduits',
                '7️⃣ ELECTRICAL WORKS',
                '7.1',
                'LS'
            ),
            (
                'Distribution boards',
                '7️⃣ ELECTRICAL WORKS',
                '7.2',
                'No.'
            ),
            (
                'Lighting fixtures',
                '7️⃣ ELECTRICAL WORKS',
                '7.3',
                'No.'
            ),
            (
                'Power sockets & switches',
                '7️⃣ ELECTRICAL WORKS',
                '7.4',
                'No.'
            ),
            (
                'Water supply piping (PPR)',
                '8️⃣ PLUMBING WORKS',
                '8.1',
                'LS'
            ),
            (
                'Drainage piping (PVC)',
                '8️⃣ PLUMBING WORKS',
                '8.2',
                'LS'
            ),
            (
                'Sanitary fixtures (bathrooms)',
                '8️⃣ PLUMBING WORKS',
                '8.3',
                'No.'
            ),
            (
                'Water tanks',
                '8️⃣ PLUMBING WORKS',
                '8.4',
                'No.'
            ),
            (
                'Interlock paving',
                '9️⃣ EXTERNAL WORKS',
                '9.1',
                'm2'
            ),
            (
                'Boundary wall',
                '9️⃣ EXTERNAL WORKS',
                '9.2',
                'm'
            ),
            ('Landscaping', '9️⃣ EXTERNAL WORKS', '9.3', 'LS'),
            -- Construction Materials
            (
                'Reinforced steel (rebar)',
                'Structural Materials',
                'MAT-1',
                'ton'
            ),
            (
                'Concrete',
                'Structural Materials',
                'MAT-2',
                'm3'
            ),
            ('Cement', 'Structural Materials', 'MAT-3', 'bag'),
            (
                'Bricks / Blocks',
                'Structural Materials',
                'MAT-4',
                '1000 pcs'
            ),
            (
                'Ceramic & porcelain tiles',
                'Finishing Materials',
                'MAT-5',
                'm2'
            ),
            (
                'Marble & granite',
                'Finishing Materials',
                'MAT-6',
                'm2'
            ),
            (
                'Gypsum board',
                'Finishing Materials',
                'MAT-7',
                'm2'
            ),
            (
                'Paint',
                'Finishing Materials',
                'MAT-8',
                'bucket'
            ),
            (
                'Electrical cables & panels',
                'MEP Materials',
                'MAT-9',
                'LS'
            ),
            (
                'PVC & PPR pipes',
                'MEP Materials',
                'MAT-10',
                'LS'
            ),
            (
                'Air conditioning systems',
                'MEP Materials',
                'MAT-11',
                'No.'
            ),
            ('Water pumps', 'MEP Materials', 'MAT-12', 'No.'),
            (
                'Aluminum windows',
                'Doors & Windows',
                'MAT-13',
                'm2'
            ),
            (
                'Wooden doors',
                'Doors & Windows',
                'MAT-14',
                'No.'
            ),
            (
                'Glass façades',
                'Doors & Windows',
                'MAT-15',
                'm2'
            ),
            (
                'Metal gates',
                'Doors & Windows',
                'MAT-16',
                'No.'
            )
    ) AS item(name, description, code, unit)
WHERE NOT EXISTS (
        SELECT 1
        FROM public.inventory
        WHERE organization_id = org_record.id
            AND name = item.name
    );
END LOOP;
END $$;