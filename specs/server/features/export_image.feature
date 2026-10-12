Feature: Asset Image Export Across Protocol Transports

  Scenario: Export full asset image without profile defaults to LLM profile
    Given an asset named "HQ Bunker" with dimensions 16 by 16
    And official brick color 17 is "Earth Green" with hex "#184632"
    And the asset has painted cells:
      | x | y | colorId |
      | 0 | 0 | 17      |
    When I export the asset image without specifying a profile
    Then the export response should contain valid base64 PNG image data
    And the exported image pixel dimensions should be 256 by 256
    And the exported image stud at (0, 0) should be colored "#184632"
    And the exported image stud at (1, 1) should have a 2 by 2 checkerboard pattern of "#27272a" and "#18181b"

  Scenario: Export asset image with high resolution print profile
    Given an asset named "Print Mat" with dimensions 16 by 16
    And official brick color 5 is "Bright Red" with hex "#C91A09"
    And the asset has painted cells:
      | x | y | colorId |
      | 0 | 0 | 5       |
    When I export the asset image with profile "print"
    Then the export response should contain valid base64 PNG image data
    And the exported image pixel dimensions should be 1024 by 1024
    And the exported image stud at (0, 0) should be colored "#C91A09"
    And the unpainted stud at (1, 1) should be colored "#FFFFFF"

  Scenario: Export framed sub-region within asset boundaries
    Given an asset named "Sector Alpha" with dimensions 32 by 32
    And official brick color 12 is "Bright Yellow" with hex "#F2CD37"
    And the asset has painted cells:
      | x  | y  | colorId |
      | 10 | 10 | 12      |
    When I export the asset image with bounding box (8, 8, 8, 8) and profile "llm"
    Then the export response should contain valid base64 PNG image data
    And the exported image pixel dimensions should be 128 by 128
    And the exported image stud at local position (2, 2) should be colored "#F2CD37"

  Scenario: Export exact tangent boundary edge bounding box
    Given an asset named "Edge Touch" with dimensions 16 by 16
    And official brick color 17 is "Earth Green" with hex "#184632"
    And the asset has painted cells:
      | x  | y  | colorId |
      | 15 | 15 | 17      |
    When I export the asset image with bounding box (8, 8, 8, 8) and profile "llm"
    Then the export response should contain valid base64 PNG image data
    And the exported image pixel dimensions should be 128 by 128
    And the exported image stud at local position (7, 7) should be colored "#184632"

  Scenario: Export single stud bounding box
    Given an asset named "Single Stud Crop" with dimensions 16 by 16
    And official brick color 17 is "Earth Green" with hex "#184632"
    And the asset has painted cells:
      | x | y | colorId |
      | 3 | 3 | 17      |
    When I export the asset image with bounding box (3, 3, 1, 1) and profile "llm"
    Then the export response should contain valid base64 PNG image data
    And the exported image pixel dimensions should be 16 by 16
    And the exported image stud at local position (0, 0) should be colored "#184632"

  Scenario Outline: Reject invalid or out-of-bounds bounding boxes
    Given an asset named "BBox Validation" with dimensions 16 by 16
    When I export the asset image with bounding box (<x>, <y>, <width>, <height>)
    Then the export operation should fail with invalid params error

    Examples:
      | x   | y   | width | height |
      | -1  | 0   | 4     | 4      |
      | 0   | -1  | 4     | 4      |
      | 0   | 0   | 0     | 4      |
      | 0   | 0   | 4     | 0      |
      | 0   | 0   | -2    | 4      |
      | 0   | 0   | 4     | -2     |
      | 15  | 0   | 2     | 2      |
      | 0   | 15  | 2     | 2      |
      | 25  | 25  | 10    | 10     |

  Scenario: Reject export for non-existent asset ID
    When I export an image for non-existent asset "00000000-0000-0000-0000-000000000000"
    Then the export operation should fail with invalid params error

  Scenario: Reject export with unrecognized profile
    Given an asset named "Profile Test" with dimensions 16 by 16
    When I export the asset image with profile "ultra_hd"
    Then the export operation should fail with invalid params error

  Scenario Outline: Compute adaptive export dimensions for LLM profile
    Given an asset named "Adaptive Size Test" with dimensions <width> by <height>
    When I export the asset image with profile "llm"
    Then the exported image pixel dimensions should be <expectedPxWidth> by <expectedPxHeight>

    Examples:
      | width | height | expectedPxWidth | expectedPxHeight |
      | 16    | 16     | 256             | 256              |
      | 32    | 32     | 512             | 512              |
      | 64    | 64     | 768             | 768              |
      | 100   | 200    | 400             | 800              |
      | 200   | 100    | 800             | 400              |
      | 400   | 400    | 800             | 800              |
