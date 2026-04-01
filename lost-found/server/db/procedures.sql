-- =============================================================
--  STORED PROCEDURE  (MySQL syntax — for lab demonstration)
--  SQLite/Turso does not support stored procedures natively;
--  the equivalent logic is implemented as a transaction in
--  server/routes/claims.js (sp_resolve_claim equivalent).
-- =============================================================

DELIMITER //

-- -------------------------------------------------------------
-- Procedure: sp_resolve_claim
--
-- Purpose:
--   Resolves a claim by updating its status (Verified/Rejected),
--   assigning the admin who handled it, and — if verified —
--   automatically marking the found item as matched and
--   rejecting all other pending claims for the same found item.
--
-- Parameters:
--   p_claim_id  — the ClaimID to resolve
--   p_admin_id  — the AdminID processing the resolution
--   p_status    — 'Verified' or 'Rejected'
--
-- Usage:
--   CALL sp_resolve_claim(2, 1, 'Verified');
-- -------------------------------------------------------------
CREATE PROCEDURE sp_resolve_claim(
  IN p_claim_id  INT,
  IN p_admin_id  INT,
  IN p_status    VARCHAR(10)
)
BEGIN
  DECLARE v_found_item_id INT;

  -- Step 1: Fetch the FoundItemID for this claim
  SELECT FoundItemID INTO v_found_item_id
  FROM CLAIM
  WHERE ClaimID = p_claim_id;

  -- Step 2: Update the target claim's status and assign admin
  UPDATE CLAIM
  SET   Status  = p_status,
        AdminID = p_admin_id
  WHERE ClaimID = p_claim_id;

  -- Step 3: If Verified — mark the found item as matched
  --         and reject all other pending claims for it
  IF p_status = 'Verified' THEN

    UPDATE FOUND_ITEM
    SET    Is_Matched = 1
    WHERE  FoundItemID = v_found_item_id;

    UPDATE CLAIM
    SET    Status = 'Rejected'
    WHERE  FoundItemID = v_found_item_id
      AND  ClaimID    != p_claim_id
      AND  Status      = 'Pending';

  END IF;
END //

DELIMITER ;
