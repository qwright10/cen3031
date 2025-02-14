# Database Schema

<details>
<summary>Legend</summary>

- \* Primary key
- `account.id` foreign key
- ? nullable type

</details>

## `account`
| Name              | Type  | 
|-------------------|-------|
| id*               | uuid  |
| username          | text  |
| email_hash        | text? |
| password          | text? |
| is_email_verified | bool  |

## `challenge`
| Name       | Type          |
|------------|---------------|
| id*        | uuid          |
| user_id    | `account.id`? |
| challenge  | bytea         |
| email_hash | text?         |
| username   | text          |
| password   | text?         |

## `credential`
| Name            | Type         |
|-----------------|--------------|
| id*             | bytes        |
| user_id         | `account.id` |
| type            | text         |
| sign_count      | int          |
| uv_initialized  | bool         |
| transports      | text[]       |
| backup_eligible | bool         |
| backup_state    | bool         |
| jwt             | json         |

## `question`
| Name    | Type            | Comment                                                                                                | 
|---------|-----------------|--------------------------------------------------------------------------------------------------------|
| id*     | uuid            |                                                                                                        |
| quiz_id | `quiz.id`       |                                                                                                        |
| type    | `question_type` |
| prompt  | text            |                                                                                                        |
| choices | text[]?         | except for `true_false`, an array of answer choices                                                    |
| answers | int[]           | for `true_false`, contains integer equivalent of true/false, else the index/indices of correct answers |

## `question_type`
| Variant           |
|-------------------|
| `multiple_choice` |
| `multiple_select` |
| `true_false`      |

## `quiz`
| Name       | Type        |
|------------|-------------|
| id*        | uuid        |
| owner_id   | `acount.id` |
| name       | text        |
| is_private | bool        |


