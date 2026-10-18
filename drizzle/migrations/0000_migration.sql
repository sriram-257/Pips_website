CREATE TABLE public.guestbook_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT nickname_len CHECK (char_length(btrim(nickname)) BETWEEN 1 AND 24),
  CONSTRAINT message_len CHECK (char_length(btrim(message)) BETWEEN 3 AND 140)
);
GRANT SELECT, INSERT ON public.guestbook_entries TO anon, authenticated;
GRANT ALL ON public.guestbook_entries TO service_role;
ALTER TABLE public.guestbook_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read guestbook" ON public.guestbook_entries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can sign guestbook" ON public.guestbook_entries FOR INSERT TO anon, authenticated
  WITH CHECK (char_length(btrim(nickname)) BETWEEN 1 AND 24 AND char_length(btrim(message)) BETWEEN 3 AND 140);
CREATE INDEX guestbook_created_idx ON public.guestbook_entries (created_at DESC);

-- Anti-spam: force server timestamp, trim, block floods and duplicates.
CREATE OR REPLACE FUNCTION public.guestbook_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.id := gen_random_uuid();
  NEW.created_at := now();
  NEW.nickname := btrim(NEW.nickname);
  NEW.message := btrim(NEW.message);
  IF (SELECT count(*) FROM public.guestbook_entries WHERE created_at > now() - interval '1 minute') >= 15 THEN
    RAISE EXCEPTION 'guestbook_busy' USING ERRCODE = 'P0001';
  END IF;
  IF EXISTS (SELECT 1 FROM public.guestbook_entries WHERE lower(nickname) = lower(NEW.nickname) AND created_at > now() - interval '30 seconds') THEN
    RAISE EXCEPTION 'guestbook_slow_down' USING ERRCODE = 'P0001';
  END IF;
  IF EXISTS (SELECT 1 FROM public.guestbook_entries WHERE lower(message) = lower(NEW.message) AND created_at > now() - interval '1 hour') THEN
    RAISE EXCEPTION 'guestbook_duplicate' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER guestbook_guard BEFORE INSERT ON public.guestbook_entries FOR EACH ROW EXECUTE FUNCTION public.guestbook_guard();

-- Global visit counter, only reachable through functions.
CREATE TABLE public.site_counter (
  id int PRIMARY KEY CHECK (id = 1),
  visits bigint NOT NULL DEFAULT 0
);
GRANT ALL ON public.site_counter TO service_role;
ALTER TABLE public.site_counter ENABLE ROW LEVEL SECURITY;
INSERT INTO public.site_counter (id, visits) VALUES (1, 0);

CREATE OR REPLACE FUNCTION public.register_visit()
RETURNS bigint LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.site_counter SET visits = visits + 1 WHERE id = 1 RETURNING visits;
$$;
CREATE OR REPLACE FUNCTION public.get_visits()
RETURNS bigint LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT visits FROM public.site_counter WHERE id = 1;
$$;
REVOKE ALL ON FUNCTION public.register_visit() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_visits() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_visit() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_visits() TO anon, authenticated;
REVOKE ALL ON FUNCTION public.guestbook_guard() FROM PUBLIC, anon, authenticated;