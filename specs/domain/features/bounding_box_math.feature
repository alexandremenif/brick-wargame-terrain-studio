Feature: Pure Bounding Box Mathematics & Clamping

  Scenario: Clamping bounding box within asset boundaries
    When I clamp a bounding box (30, 30, 10, 10) against asset dimensions 32 by 32
    Then the clamped bounding box should be (22, 22, 10, 10)

  Scenario: Clamping bounding box dimensions that exceed asset dimensions
    When I clamp a bounding box (0, 0, 48, 64) against asset dimensions 32 by 32
    Then the clamped bounding box should be (0, 0, 32, 32)

  Scenario: Panning bounding box by delta offsets
    Given a bounding box at (10, 10, 8, 8) on a 32 by 32 asset
    When I pan the bounding box by delta X 5 and delta Y -4
    Then the resulting bounding box should be (15, 6, 8, 8)

  Scenario: Panning bounding box clamped at boundary edge
    Given a bounding box at (20, 20, 10, 10) on a 32 by 32 asset
    When I pan the bounding box by delta X 10 and delta Y 10
    Then the resulting bounding box should be (22, 22, 10, 10)

  Scenario: Centering bounding box at target coordinate
    When I center an 8 by 8 bounding box at stud (16, 16) on a 32 by 32 asset
    Then the resulting bounding box should be (12, 12, 8, 8)

  Scenario: Centering bounding box near asset edge clamps within boundaries
    When I center an 8 by 8 bounding box at stud (31, 31) on a 32 by 32 asset
    Then the resulting bounding box should be (24, 24, 8, 8)

  Scenario: Zooming in scales down dimensions centered on view center
    Given a bounding box at (4, 4, 16, 16) on a 32 by 32 asset
    When I zoom the bounding box by scale factor 0.8
    Then the resulting bounding box width should be 13
    And the resulting bounding box height should be 13
    And the resulting bounding box should be (6, 6, 13, 13)

  Scenario: Zooming out scales up dimensions centered on view center
    Given a bounding box at (12, 12, 8, 8) on a 32 by 32 asset
    When I zoom the bounding box by scale factor 1.25
    Then the resulting bounding box width should be 10
    And the resulting bounding box height should be 10
    And the resulting bounding box should be (11, 11, 10, 10)

  Scenario: Zooming in respects minimum 1x1 stud constraint
    Given a bounding box at (10, 10, 1, 1) on a 32 by 32 asset
    When I zoom the bounding box by scale factor 0.5
    Then the resulting bounding box width should be 1
    And the resulting bounding box height should be 1

  Scenario: Zooming out respects maximum asset bounds constraint
    Given a bounding box at (0, 0, 30, 30) on a 32 by 32 asset
    When I zoom the bounding box by scale factor 2.0
    Then the resulting bounding box width should be 32
    And the resulting bounding box height should be 32
    And the resulting bounding box should be (0, 0, 32, 32)

  Scenario: Recovering from stale bounding box with out-of-bounds coordinates
    When I recover raw bounding box X 40, Y 40, Width 16, Height 16 against asset dimensions 32 by 32
    Then the recovered bounding box should be (16, 16, 16, 16)

  Scenario: Recovering from corrupt raw bounding box input
    When I attempt to recover corrupt raw bounding box "invalid-json" against asset dimensions 32 by 32
    Then the recovery result should be null
