Feature: Terrain Map Management & Spatial Invariants

  Background:
    Given a new TerrainMap with dimensions 118 by 225 studs

  Scenario: Creating a map asset with arbitrary dimensions
    Given a new TerrainMap with dimensions 32 by 32 studs
    Then the map width should be 32 studs
    And the map height should be 32 studs
    And all cells should be unpainted

  Scenario: Painting a bounding box with official LEGO color
    When I paint the bounding box (10, 10, 20, 20) with LEGO color "Bright Green"
    Then the bounding box (10, 10, 20, 20) should have color "Bright Green"
    And exactly 400 cells should be painted
    And the undo history should have 1 entry

  Scenario: Undoing a painted bounding box
    When I paint the bounding box (10, 10, 20, 20) with LEGO color "Bright Green"
    And I undo the last operation
    Then exactly 0 cells should be painted
    And the undo history should have 0 entries

  Scenario: Rejecting out-of-bounds painting beyond dimensions
    When I attempt to paint a cell at coordinate (150, 50)
    Then an out-of-bounds error should be raised
    And exactly 0 cells should be painted

  Scenario: Rejecting negative coordinates painting
    When I attempt to paint a cell at coordinate (-5, 10)
    Then an out-of-bounds error should be raised
    And exactly 0 cells should be painted

  Scenario: Rejecting bounding box overflow beyond grid dimensions
    When I attempt to paint the bounding box (110, 220, 20, 20) with LEGO color "Bright Green"
    Then an out-of-bounds error should be raised
    And exactly 0 cells should be painted
