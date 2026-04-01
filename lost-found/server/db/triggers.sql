-- =============================================================
--  TRIGGERS  (SQLite / Turso compatible)
-- =============================================================

-- -------------------------------------------------------------
-- Trigger 1: trg_auto_match
-- Fires AFTER a row is inserted into MATCHES_WITH.
-- Automatically sets Is_Matched = 1 on both the LOST_ITEM and
-- FOUND_ITEM so the application can never forget to do it.
-- -------------------------------------------------------------
CREATE TRIGGER IF NOT EXISTS trg_auto_match
AFTER INSERT ON MATCHES_WITH
BEGIN
  UPDATE LOST_ITEM  SET Is_Matched = 1 WHERE LostItemID  = NEW.LostItemID;
  UPDATE FOUND_ITEM SET Is_Matched = 1 WHERE FoundItemID = NEW.FoundItemID;
END;


-- -------------------------------------------------------------
-- Trigger 2: trg_prevent_duplicate_claim
-- Fires BEFORE a row is inserted into CLAIM.
-- Raises an error if the same user already has a Pending or
-- Verified claim on the same found item, preventing duplicates.
-- -------------------------------------------------------------
CREATE TRIGGER IF NOT EXISTS trg_prevent_duplicate_claim
BEFORE INSERT ON CLAIM
WHEN (
  SELECT COUNT(*) FROM CLAIM
  WHERE UserID      = NEW.UserID
    AND FoundItemID = NEW.FoundItemID
    AND Status     != 'Rejected'
) > 0
BEGIN
  SELECT RAISE(ABORT, 'User already has an active claim for this item');
END;
